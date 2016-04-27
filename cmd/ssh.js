var utils = require('../lib/utils')

var cmd = {
  desc: 'ssh into the npm Enterprise registry container'
}

module.exports = utils.decorate(cmd, __filename)
