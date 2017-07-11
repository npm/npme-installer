#!/usr/bin/env node

var checkForUpdate = require('../lib/check-for-update')
var chalk = require('chalk')

// use hidden duplicate install command for run script
// which avoids the check-for-update so update-notifier
// config does not initially belong to root
var install = require('../cmd/install')

var yargs = require('yargs')
  .usage('$0 [command] [arguments]')
  .command(install)
  .command('autoinstall', false, install)
  .commandDir('../cmd')
  .option('s', {
    alias: 'sudo',
    description: 'should shell commands be run as sudo user',
    boolean: true,
    default: true,
    global: true
  })
  .help().alias('h', 'help')
  .version().alias('v', 'version')
  .example('$0 add-package lodash', 'add the lodash package to your whitelist')
  .demand(1, 'you must provide a command to run')
  .wrap(88)
  .strict()

// mimic standard yargs failure handler, but call checkForUpdate()
yargs.fail(function (msg, err) { // eslint-disable-line
  checkForUpdate()
  yargs.showHelp('error')
  console.error(msg)
  process.exit(1)
}).argv

process.on('uncaughtException', function (err) {
  // if there is no Internet connection
  // native-dns throws an uncaught ENOENT exception
  // let's ignore this.
  if (err.code === 'ENOENT') return
  console.log(chalk.red(err.message))

  process.exit(0)
})
