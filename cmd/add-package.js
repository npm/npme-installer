var utils = require('../lib/utils')

var adminCommand = utils.adminCommand
var exec = utils.exec
var command = utils.command(__filename)

var cmd = {
  command: command,
  desc: 'add a package to your whitelist',
  usage: '$0 ' + command + ' package-name[@version] -- [opts]',
  demand: 1,
  demandDesc: 'you must provide a package name and optional version',
  epilog: 'add a new package to your appliance\'s whitelist'
}

cmd.handler = function (argv) {
  var cmd = adminCommand + argv._.join(' ')
  if (argv._[1].lastIndexOf('@') > 0) cmd += ' --all-versions=false'
  exec(cmd, argv.sudo, function () {})
}

module.exports = utils.decorate(cmd)
