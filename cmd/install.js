var chalk = require('chalk')
var boxen = require('boxen')
var figures = require('figures')
var fs = require('fs')
var path = require('path')
var publicIp = require('public-ip')
var request = require('request')
var utils = require('../lib/utils')

var cwd = utils.cwd
var exec = utils.exec

var cmd = {
  desc: 'install the npm Enterprise appliance',
  options: {
    r: {
      alias: 'release',
      default: 'docker',
      description: 'what release of replicated should be used (defaults to stable)',
      type: 'string'
    },
    d: {
      alias: 'docker-version',
      description: 'the specific Docker version to use',
      type: 'string'
    },
    i: {
      alias: 'internal-address',
      description: 'the private ip address of the eth0 adapter',
      type: 'string'
    },
    e: {
      alias: 'external-address',
      description: 'the public facing ip address for the server',
      type: 'string'
    },
    p: {
      alias: 'http-proxy',
      description: 'sets the HTTP proxy for Docker and Replicated',
      type: 'string'
    },
    u: {
      alias: 'unattended-install',
      description: 'allows for unattended install to succeed'
    }
  },
  epilog: 'install a brand new npm Enterprise appliance'
}

cmd.handler = function (argv) {
  exec('cp replicated-license-retrieval.json /etc', argv.sudo, function () {
    var release = argv.release ? '/' + argv.release : ''

    request.get('https://get.replicated.com' + release, function (err, res, content) {
      if (err) {
        console.log(chalk.red(err.message))
        return
      }

      fs.writeFileSync(path.resolve(cwd, './install.sh'), content, 'utf-8')
      var commandSegments = [ 'bash', 'install.sh' ]
      if (argv.u) {
        commandSegments.push('bypass-storagedriver-warnings')
        if (!argv.p) {
          commandSegments.push('no-proxy')
        }
      }
      if (argv.e) {
        commandSegments.push('public-address=' + argv.e)
      }
      if (argv.i) {
        commandSegments.push('private-address=' + argv.i)
      }
      if (argv.d) {
        commandSegments.push('docker-version=' + argv.d)
      }
      if (argv.p) {
        commandSegments.push('http-proxy=' + argv.p)
      }
      var commandLine = commandSegments.join(' ')

      exec(commandLine, argv.sudo, function (code) {
        if (code !== 0) {
          console.log(chalk.bold.red('oh no! something went wrong during the install...\r\n') +
            chalk.bold.red('contact ') +
            chalk.bold.green('support@npmjs.com ') +
            chalk.bold.red('and we can help get you up and running'))
        } else {
          exec('mkdir -p /etc/replicated/brand/', argv.sudo, function () {
            exec('cp -f brand.css /etc/replicated/brand/brand.css', argv.sudo, function () {})
          })

          publicIp.v4(function (err, ip) {
            var accessMessage

            if (err) {
              accessMessage = ' Access the admin console in a web-browser via port ' + chalk.bold.cyan(8800)
            } else {
              accessMessage = ' Access the admin console in a web-browser at ' + chalk.bold.cyan('http://' + ip + ':8800')
            }

            console.log(
              boxen(
                figures.squareSmall + accessMessage + '\n\n' +
                figures.tick + ' Visit ' + chalk.bold.cyan('https://docs.npmjs.com/') + ', for information about using npm Enterprise or contact ' + chalk.bold.cyan('support@npmjs.com'),
                {padding: 1}
              )
            )
          })
        }
      })
    })
  })
}

module.exports = utils.decorate(cmd, __filename)
