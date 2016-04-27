var updateNotifier = require('update-notifier')
var packageJson = require('../package.json')

module.exports = function () {
  // super hacky: skip for autoinstall command
  if (isNpm || (process.argv.length > 2 && process.argv[2] === 'autoinstall')) return

  // beware file permissions problems b/w sudo and not
  try {
    var notifier = updateNotifier({
      pkg: packageJson
    })
    notify(notifier, {
      updateCommand: 'sudo npm i -g',
      borderStyle: 'double-single'
    })
  } catch (_) {}
}

// argh! have to duplicate the UpdateNotifier.notify logic to use a custom message!
var isNpm = require('is-npm')
var boxen = require('boxen')
var chalk = require('chalk')

function notify (notifier, opts) {
  if (!process.stdout.isTTY || isNpm || !notifier.update) {
    return notifier
  }

  opts = opts || {}

  var message = '\n' + boxen('Update available ' + chalk.dim(notifier.update.current) + chalk.reset(' → ') + chalk.green(notifier.update.latest) + ' \nRun ' + chalk.cyan((opts.updateCommand || 'npm i -g ') + notifier.packageName) + ' to update', {
    padding: 1,
    margin: 1,
    borderColor: 'yellow',
    borderStyle: opts.borderStyle || 'round'
  })

  if (opts.defer === undefined) {
    process.on('exit', function () {
      console.error(message)
    })
  } else {
    console.error(message)
  }

  return notifier
}
