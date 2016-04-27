var updateNotifier = require('update-notifier')
var packageJson = require('../package.json')

module.exports = function () {
  updateNotifier({
    pkg: packageJson
  }).notify()
}
