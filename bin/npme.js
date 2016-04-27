#!/usr/bin/env node

require('../lib/check-for-update')()
var chalk = require('chalk')

require('yargs')
  .usage('$0 [command] [arguments]')
  .command(require('../cmd/install'))
  .command(require('../cmd/ssh'))
  .command(require('../cmd/add-package'))
  .command(require('../cmd/remove-package'))
  .command(require('../cmd/reset-follower'))
  .command(require('../cmd/update-license'))
  .command(require('../cmd/manage-tokens'))
  .command(require('../cmd/edit-homepage'))
  .command(require('../cmd/addon'))
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
  .argv

process.on('uncaughtException', function (err) {
  // if there is no Internet connection
  // native-dns throws an uncaught ENOENT exception
  // let's ignore this.
  if (err.code === 'ENOENT') return
  console.log(chalk.red(err.message))
  process.exit(0)
})
