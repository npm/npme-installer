var chalk = require('chalk')
var inquirer = require('inquirer')
var utils = require('../lib/utils')
var which = require('which')

var cmd = {
  desc: "generate a cront tab line for npme's CouchDB maintenace script"
}

cmd.handler = function (argv) {
  const npmeBin = which.sync('npme')
  inquirer.prompt([
    {
      type: 'input',
      name: 'scan',
      message: 'we stream all the documents in this database (the replica)'
    },
    {
      type: 'input',
      name: 'check',
      message: 'we request each doc in the stream from scan to see if check has the same versions (the primary)'
    },
    {
      type: 'input',
      name: 'data-directory',
      message: 'data directory to store missing tarballs to',
      default: '/usr/local/lib/npme/packages'
    }
  ]).then(function (answers) {
    console.log(answers)
    console.log('add the following to your crontab:')
    console.log(chalk.green('0\t*\t*\t*\t*\t ' + npmeBin + ' maintenance --check=' + answers.check + ' --scan=' + answers.scan + ' --data-directory=' + answers['data-directory']))
  })
}

module.exports = utils.decorate(cmd, __filename)
