var chalk = require('chalk')
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

      exec('sh install.sh', argv.sudo, function (code) {
        if (code !== 0) {
          console.log(chalk.bold.red('oh no! something went wrong during the install...\r\n') +
            chalk.bold.red('contact ') +
            chalk.bold.green('support@npmjs.com ') +
            chalk.bold.red('and we can help get you up and running'))
        } else {
          exec('mkdir -p /etc/replicated/brand/', argv.sudo, function () {
            exec('cp -f brand.css /etc/replicated/brand/brand.css', argv.sudo, function () {})
          })

          console.log(chalk.bold.green('Congrats! Your npm Enterprise server is now up and running \\o/'))
          console.log(chalk.bold('\nThere are just a few final steps:\n'))

          publicIp.v4(function (err, ip) {
            var accessMessage

            if (err) {
              accessMessage = 'Access this server in a web-browser via port 8800 (this will bring you to an admin console)'
            } else {
              accessMessage = 'Access this server in a web-browser at https://' + ip + ':8800 (this will bring you to an admin console)'
            }

            ;[
              accessMessage,
              'Proceed passed the HTTPS connection security warning (a self-signed cert is being used initially)',
              'Upload a custom TLS/SSL cert/key or proceed with the provided self-signed pair.',
              'Configure your npm instance & click "Save".',
              'Visit https://docs.npmjs.com/, for information about using npm Enterprise or contact support@npmjs.com'
            ].forEach(function (s, i) {
              console.log(chalk.bold('Step ' + (i + 1) + '.') + ' ' + s)
            })
          })
        }
      })
    })
  })
}

module.exports = utils.decorate(cmd, __filename)
