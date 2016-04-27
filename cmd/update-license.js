var utils = require('../lib/utils')

var cmd = {
  desc: 'update the license associated with your npm Enterprise appliance',
  epilog: 'update the license on your npm Enterprise appliance'
}

module.exports = utils.decorate(cmd, __filename)
