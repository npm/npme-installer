var utils = require('../lib/utils')

var command = utils.command(__filename)

var cmd = {
  command: command,
  desc: 'remove a package from your registry',
  usage: '$0 ' + command + ' package-name -- [opts]',
  demand: 1,
  demandDesc: 'you must provide a package to remove'
}

module.exports = utils.decorate(cmd)
