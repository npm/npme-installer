var utils = require('../lib/utils')
var follow = require('../lib/replication-check.js')

var cmd = {
  desc: "run maintenance against a CouchDB server (make sure it's packages are up-to-date)"
}

cmd.builder = function (yargs) {
  yargs
    .option('check', {
      describe: 'we request each doc in the stream from scan to see if check has the same versions (the primary).\nexample: https://theprimary:8080',
      demand: true
    })
    .option('scan', {
      describe: 'we stream all the documents in this database (the replica).\nexample: http://admin:admin@172.17.0.1:5984/registry\nyou can find this by running `sudo docker ps | grep klaemo | sed \'s/->/ /\' | awk \'{print $(NF-2)}\'`',
      demand: true
    })
    .option('data-directory', {
      describe: 'data directory to store missing tarballs',
      default: '/usr/local/lib/npme/packages'
    })
    .option('tar-host', {
      describe: 'download tarballs from this host instead of the external url for your npme. most likely the host you use for `check`. example: https://theprimary:8080',
      default: false
    })
    .option('dry-run', {
      describe: 'only print packages that are missing versions instead of attempting to repair them',
      default: false
    })
    .option('shared-fetch-secret', {
      describe: 'secret to populate when interacting with primary server.'
    })
}

cmd.handler = function (argv) {
  // process.removeListener('UncaughtException')
  console.log(argv)

  var stream = follow(function (data, cb) {
    var message = data.name + '\t' + JSON.stringify(data.versions)

    if (argv.dryRun) {
      console.log(message)
      return cb()
    }

    if (data.error) {
      console.log('[error] ' + data.name + ' ' + data.error)
      return cb()
    }

    cb = timerwrap(cb, data.name)

    follow.repairVersions({
      db: argv.scan,
      oldDoc: data.scan,
      currentDoc: data.check,
      versions: data.versions,
      tarHost: argv.tarHost,
      dataDirectory: argv.dataDirectory,
      sharedFetchSecret: argv.sharedFetchSecret
    }, function (err, data) {
      if (err) {
        message += '\terror. ' + err
      } else {
        message += '\trepaired!'
      }

      console.log(message)

      cb()
    })
  }, {
    check: argv.check,
    scan: argv.scan,
    sharedFetchSecret: argv.sharedFetchSecret
  })

  setInterval(function () {
    console.log(stream.sequence)
  }, 5000).unref()
}

module.exports = utils.decorate(cmd, __filename)

function timerwrap (cb, name) {
  var timer
  function wrapped () {
    clearTimeout(timer)
    console.log('[timeout] ', name)
    cb.apply(this, arguments)
  }
  setTimeout(function () {
    wrapped()
  }, 180000)

  return wrapped
}
