var chalk = require('chalk')
var inquirer = require('inquirer')
var utils = require('../lib/utils')
var which = require('which')
var exec = utils.exec

var cmd = {
  desc: "generate a cront tab line for npme's CouchDB maintenace script"
}

cmd.handler = function (argv) {
  const npmeBin = which.sync('npme')
  inquirer.prompt([
    {
      type: 'input',
      name: 'upstream',
      message: 'upstream CouchDB server to verify against'
    },
    {
      type: 'input',
      name: 'local',
      message: 'local CouchDB server to verify'
    },
  ]).then(function (answers) {
    console.log('add the following to your crontab:')
    console.log(chalk.green('0\t*\t*\t*\t*\t ' + npmeBin + ' maintenance --upstream=' + answers.upstream + ' --local=' + answers.local))
  })
}

module.exports = utils.decorate(cmd, __filename)
