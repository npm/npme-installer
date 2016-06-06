var updateNotifier = require('update-notifier')
var packageJson = require('../package.json')
var isNpm = require('is-npm')
var boxen = require('boxen')
var chalk = require('chalk')
var ansiAlign = require('ansi-align')

module.exports = function () {
  // super hacky: skip for autoinstall command
  if (isNpm || (process.argv.length > 2 && process.argv[2] === 'autoinstall')) return

  // beware file permissions problems b/w sudo and not
  try {
    var notifier = updateNotifier({
      pkg: packageJson
    })
    notify(notifier, {
      updateCommand: 'sudo npm i -g --ignore-scripts ',
      borderStyle: 'double-single'
    })
  } catch (_) {
    var msg = ansiAlign(
      chalk.yellow('npme update check failed') +
      '\nTry running as sudo next time, or run:\n' +
      chalk.cyan(' sudo chown -R $USER:$(id -gn $USER) ~/.config ') +
      '\nto give your user access to the update config'
    )
    process.on('exit', function () {
      console.error('\n' + boxen(msg))
    })
  }
}

// argh! have to duplicate the UpdateNotifier.notify logic to use a custom message!
function notify (notifier, opts) {
  if (!process.stdout.isTTY || isNpm || !notifier.update) {
    return notifier
  }

  opts = opts || {}

  var message = '\n' + boxen(
    ansiAlign(
      'Update available ' + chalk.dim(notifier.update.current) + chalk.reset(' → ') + chalk.green(notifier.update.latest) +
      ' \nRun ' + chalk.cyan((opts.updateCommand || 'npm i -g ') + notifier.packageName) + ' to update'
    ),
    {
      padding: 1,
      margin: 1,
      borderColor: 'yellow',
      borderStyle: opts.borderStyle || 'round'
    }
  )

  if (opts.defer === undefined) {
    process.on('exit', function () {
      console.error(message)
    })
  } else {
    console.error(message)
  }

  return notifier
}
