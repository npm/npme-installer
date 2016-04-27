var utils = require('../lib/utils')

var command = utils.command(__filename)

var cmd = {
  command: command,
  desc: 'install a third-party addon',
  usage: '$0 ' + command + ' <addon> -- [opts]',
  demand: 1,
  demandDesc: 'you must specify an addon to install'
}

module.exports = utils.decorate(cmd)
