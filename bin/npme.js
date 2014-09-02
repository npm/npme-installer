#!/usr/bin/env node

var yargs = require('yargs'),
  logger = require('../lib/logger'),
  npme = require('../lib'),
  commands = {
    'install': {
      description: 'install:\t install npm Enterprise on a (preferably) blank operating system.',
      command: function(arguments) {
        require('../lib')();
      }
    }
  },
  usageString = "npm Enterprise one-click-install\n\n";

// generate usage string.
Object.keys(commands).forEach(function(command) {
  usageString += commands[command].description;
});

yargs.usage(usageString);

// display help if command is not recognized.
if (yargs.argv.help || !commands[yargs.argv._[0]]) {
  logger.log(yargs.help());
} else {
  // update config singleton and run command.
  var argv = yargs.normalize().argv;

  commands[yargs.argv._[0]].command(yargs.argv);
}


process.on('uncaughtException', function(err) {
  logger.error(err.message);
  process.exit(1);
});
