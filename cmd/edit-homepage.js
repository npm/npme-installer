var utils = require('../lib/utils')

var command = utils.command(__filename)

var cmd = {
  command: command,
  desc: 'edit the packages displayed on the npme homepage',
  usage: '$0 ' + command + ' <command>'
}

module.exports = utils.decorate(cmd)
