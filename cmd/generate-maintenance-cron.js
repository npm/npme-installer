var chalk = require('chalk')
var inquirer = require('inquirer')
var utils = require('../lib/utils')
var which = require('which')
var url = require('url')
var request = require('request')
var fs = require('fs')

var cmd = {
  desc: "generate a cron tab line for npme's CouchDB maintenace script"
}

cmd.handler = function (argv) {
  const npmeBin = which.sync('npme')

  // allow folks to procede after auth failure on scan url.
  var failedScanValidate = false
  // populated when validating scan url
  var checkPackageName
  // extracted from check hosts metadata for checkPackageName
  var tarHost

  inquirer.prompt([
    {
      type: 'input',
      name: 'scan',
      message: 'we stream all the documents in this database (the replica).',
      default: 'http://admin:admin@172.17.0.1:5984/registry',
      filter: function (input) {
        if (!failedScanValidate) {
          input = cleanCheckUrl(input)
        }
        return input
      },
      validate: function (input) {
        var alreadyFailed = failedScanValidate
        var done = this.async()
        if (!alreadyFailed) {
          input = cleanCheckUrl(input)
        }

        process.stdout.write('  ...checking ' + input)

        request.get(input + '/_changes' + '?start=1&limit=20', function (err, res, body) {
          if (err) {
            return done(err + '')
          }
          var reso = json(body) || {}
          // 404. the database specified in the url doesnt exist.
          // 400. _changes is not a valid db name. this means they did not specify a url

          if (reso.error || res.statusCode !== 200) {
            var message = reso.error || ''
            if (res.statusCode === 404) {
              message += '\ncould not find the database name specified by the url.'
            } else if (res.statusCode === 401) {
              // This flag is set here to allow someone to submit credentials that dont have write access.
              // they have to type them twice but this allows folks to generate the command and figure it out later.
              // also makes it possible to test generating on replicate.npmjs.com =P
              failedScanValidate = true
              message += '\nincorrect username and password provided. please replace ' + url.parse(input).auth + ' in the url.'
            }

            message += '\nplease copy and update this value: ' + chalk.yellow(url.resolve(input, '/registry'))

            if (alreadyFailed) {
              console.log(chalk.yellow('Warning. could not verify scan url.'))
              done(false, true)
            } else {
              done(message, false)
            }
            return
          }

          // also we hit this to gather a package name to check to validate the:
          // 1. check url
          // 2. tarball host!
          //
          // try to find one unscoped package name
          // else take the first one thats not _design
          // otherwise this db is just empty and that's ok also.

          var notDesign
          var unscoped

          (reso.results || []).forEach(function (r) {
            var id = r.id || ''
            if (id.length && id.indexOf('_') !== 0) {
              notDesign = id
              if (id.indexOf('@') === -1) {
                unscoped = id
              }
            }
          })

          checkPackageName = unscoped || notDesign

          done(false, true)
        })
      }
    },
    {
      type: 'input',
      name: 'check',
      message: 'we request each doc in the stream from scan to see if check has the same versions (the primary)',
      validate: function (input) {
        var parsed = url.parse(input)
        if (!parsed.hostname && parsed.protocol) {
          console.log('\na url is required.')
          return false
        }

        var done = this.async()
        request.get(url.resolve(input, '/' + checkPackageName), function (err, res, body) {
          if (err) {
            return done(err + '')
          } else if (res.statusCode === 200) {
            var checkPackageMetadata = json(body)
            var versions = checkPackageMetadata.versions || {}
            var dist = Object.keys(versions)[0] || {}.dist
            if (dist.tarball) {
              var parsed = url.parse(dist).host
              tarHost = parsed.protocol + '//' + parsed.host
            }
          }

          done(false, true)
        })
      }
    },
    {
      type: 'input',
      name: 'data-directory',
      message: 'data directory to store missing tarballs',
      default: '/usr/local/lib/npme/packages',
      validate: function (input) {
        // so it's bad if they repair their instance to the wrong data dir.
        // because versions will exist but tarballs wont.
        var done = this.async()

        fs.readdir(input, function (err, files) {
          done(err, !!files)
        })
      }
    },
    {
      type: 'input',
      name: 'tarhost',
      message: 'the host that has the missing tarballs. defaults to check url host.',
      // 'If the tarball urls have been rewritten to point to a load balancer that includes the replica you are repairing you may need to provide this. otherwise leave it blank.',
      default: function (answers) {
        return tarHost || answers.check
      },
      validate: function (input) {
        var o = url.parse(input)
        if (!o || !o.protocol || !o.host) {
          return 'please provide a valid url'
        }
        var done = this.async()
        process.stdout.write('.. attempting to contact ' + input)
        request.get(input, function (err) {
          done(err, !err)
        })
      }
    }
  ]).then(function (answers) {
    answers.check = cleanCheckUrl(answers.check)
    done(answers)
  })

  function done (answers) {
    canCouchdb(answers, function (err, can) {
      if (err) {
        console.error(err)
      }

      if (!can) {
        console.log('\nerrors verifying your configuration. the generated command may not work :(\n')
      }

      var cmd = npmeBin + ' maintenance --check=' + answers.check + ' --scan=' + answers.scan + ' --data-directory=' + answers['data-directory']

      if (answers.tarhost) {
        cmd += ' --tar-host=' + answers.tarhost
      }

      console.log('please test the command now by performing a "dry run". run:')
      console.log(chalk.green(cmd + ' --dry-run') + '\n')

      console.log('if you prefer to run this manually. run:')
      console.log(chalk.green(cmd) + '\n')

      console.log('if all that looks fine add the following to your crontab:')
      console.log(chalk.green('0 * * * * ' + cmd + ' 1> ' + answers['data-directory'] + '/maintenance.log 2>&1'))
    })
  }
}

function cleanCheckUrl (check) {
  var parsed = url.parse(check)
  if (parsed.pathname === '/') {
    console.log('\nno database specified in path of scan url. choosing "registry"')
    parsed.pathname = '/registry'
  }

  if (!parsed.auth) {
    parsed.auth = 'admin:admin'
  }

  return url.format(parsed)
}

function canCouchdb (answers, cb) {
  request.get(url.resolve(answers.scan, '/_active_tasks'), function (err, res, body) {
    if (err) {
      console.log('ERROR: scan\n could not request check couchdb:\n' + err)
    } else if (res.statusCode !== 200) {
      console.log('Warning: scan\n could not verify write permission to couchdb. ' + res.statusCode)
    }

    cb(false, !((err || res.statusCode === 200)))
  })
}

function json (s) {
  try {
    return JSON.parse(s)
  } catch (e) {}
}

module.exports = utils.decorate(cmd, __filename)
