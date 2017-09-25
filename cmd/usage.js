var utils = require('../lib/utils')

var command = utils.command(__filename)

var cmd = {
  command: command,
  desc: 'report npme usage information',
  usage: '$0',
}

module.exports = utils.decorate(cmd)
