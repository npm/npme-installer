var utils = require('../lib/utils')

var command = utils.command(__filename)

var cmd = {
  command: command,
  desc: 'manage npm Enterprise deploy tokens',
  usage: '$0 ' + command + ' <command> -- [opts]',
  epilog: 'manage the tokens on your npm Enterprise appliance'
}

module.exports = utils.decorate(cmd)
