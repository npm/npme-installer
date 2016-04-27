var utils = require('../lib/utils')

var cmd = {
  desc: 'reset the upstream registry follower',
  epilog: 'reset the sequence # of the upstream registry follower'
}

module.exports = utils.decorate(cmd, __filename)
