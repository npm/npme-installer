var inquirer = require('inquirer')
var utils = require('../lib/utils')
var which = require('which')
var exec = utils.exec

var cmd = {
  desc: "run maintenance against a CouchDB server (make sure it's packages are up-to-date)"
}

cmd.builder = function (yargs) {
  yargs
    .option('upstream', {
      describe: 'upstream CouchDB server to verify against',
      demand: true
    })
    .option('local', {
      describe: 'local CouchDB server to verify',
      demand: true
    })
}

cmd.handler = function (argv) {
  console.log(argv)
}

module.exports = utils.decorate(cmd, __filename)
