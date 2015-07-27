#!/usr/bin/env node

var async = require('async'),
  yargs = require('yargs')
    .options('u', {
      alias: 'user',
      default: 'npme'
    })
    .options('g', {
      alias: 'group',
      default: 'npme'
    })
    .options('s', {
      alias: 'sudo',
      default: true
    })
    .options('p', {
      alias: 'platform',
      describe: 'what platform is the installer being run on? see ./lib/platform.js'
    })
    .option('t', {
      alias: 'tarball-url',
      describe: 'path to CouchDB binary tarball URL'
    })
    .option('r', {
      alias: 'proxy',
      describe: 'provide a proxy URL for fetching the npme license.'
    }),
  npmePath = '/etc/npme',
  fs = require('fs'),
  logger = require('../lib/logger'),
  npme = require('../lib'),
  License = require('../lib/license'),
  path = require('path'),
  util = new (require('../lib/util'))(),
  npmeJson = require('npme-ansible/ansible/librarian_roles/bcoe.npme/files/package.json'),
  commands = {
    'install': {
      description: 'install\t\t\tinstall npm Enterprise on a (preferably) blank operating system.\n',
      command: function(args) {
        // create a bin for npme.

        // have we already installed?
        if (fs.existsSync('/etc/npme/.license.json')) {
          logger.success("npme is already installed, upgrading.");

          // write the current package.json.
          fs.writeFileSync(
            path.resolve(npmePath, './package.json'),
            JSON.stringify(npmeJson, null, 2)
          );

          // upgrayedd.
          async.series([
            function(done) {
              var command = 'su npme -c "./node_modules/.bin/npm cache clear; ./node_modules/.bin/npm install --registry=https://enterprise.npmjs.com --always-auth"';

              if (args.sudo.toString() === 'true') command = 'sudo ' + command;

              util.exec(command, {
                cwd: npmePath
              }, function() {
                done();
              });
            },
            function(done) {
              util.exec('./node_modules/.bin/ndm restart', {cwd: npmePath}, function(err) { done() });
            }
          ]);
        } else {
          require('../lib')(args);
        }
      }
    },
    'start': {
      description: 'start\t\t\tstart npmE and all its services.\n',
      command: function(arguments) {
        util.exec('./node_modules/.bin/ndm start', {cwd: npmePath}, function(err) {
          logger.success('npmE is now running (curl http://localhost:8080).');
        });
      }
    },
    'stop': {
      description: 'stop\t\t\tstop npmE services.\n',
      command: function(arguments) {
        util.exec('./node_modules/.bin/ndm stop', {cwd: npmePath}, function(err) {});
      }
    },
    'restart': {
      description: 'restart\t\t\trestart npmE services.\n',
      command: function(arguments) {
        util.exec('./node_modules/.bin/ndm restart', {cwd: npmePath}, function(err) {});
      }
    },
    'add-package': {
      description: 'add-package\t\tadd a package to the package-follower whitelist (add-package jquery).\n',
      command: function(arguments) {
        var package = arguments._[1] || '';

        // all defaults to true. you must set it to false ...
        // if you want to only add specific versions of a package.
        var all = true;


        if(arguments.a !== undefined) all = arguments.a === 'false'?false:arguments.a;
        if(arguments['all-versions'] !== undefined) all = arguments['all-versions'];

        all = all?'true':'false';

        util.exec('./node_modules/.bin/ndm run-script manage-whitelist add-package -a '+all+' '+ package, {cwd: npmePath}, function(err) {
          util.exec('sudo chown npme:npme ./whitelist', {cwd: npmePath}, function(err) {});
        });
      }
    },
    'reset-follower': {
      description: 'reset-follower\t\treindex from the public registry all packages listed in whitelist.\n',
      command: function(args) {
        async.series([
          function(done) {
            util.exec('./node_modules/.bin/ndm stop policy-follower', {
              cwd: npmePath
            }, function() { done(); });
          },
          function(done) {
            util.exec('rm .sequence', {
              cwd: path.resolve(npmePath, './node_modules/@npm/policy-follower')
            }, function() { done(); });
          },
          function(done) {
            util.exec('./node_modules/.bin/ndm start policy-follower', {
              cwd: npmePath
            }, function() { done(); });
          }
        ], function() {
          logger.success('reset policy follower.')
        });
      }
    },
    'update': {
      description: "update\t\t\tupdate npm Enteprise.\n",
      command: function(args) {
        util.exec(npmePath + '/node_modules/.bin/npm cache clear;' + npmePath + '/node_modules/.bin/npm install npme', {
          cwd: '/tmp'
        }, function() {
          logger.success('npm Enterprise was upgraded!');
        });
      }
    },
    'generate-scripts': {
      description: "generate-scripts\tre-generate scripts from service.json.\n",
      command: function(args) {
        var command = './node_modules/.bin/ndm generate --uid=' + args.user + ' --gid=' + args.group;

        if (args.sudo.toString() === 'true') command = 'sudo ' + command;

        util.exec(command, {cwd: npmePath}, function(err) {
          logger.success('generated os services.')
        });
      }
    },
    'update-license': {
      description: "update-license\t\tre-generate the .license.json file.",
      command: function(args) {
        var license = new License({
          proxy: args.proxy
        });
        license.update(function() {});
      }
    },
    'validate-license': {
      description: 'check license validity (without touching the .license.json file.\n',
      command: function(args) {
        var license = new License({
          proxy: args.proxy
        });
        license.interview(function() {
          // Otherwise we throw.
          console.log('license is valid.');
        });
      }
    }
  },
  usageString = "npm Enterprise. It's npm, but you run it yourself!\n\n";

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

  commands[yargs.argv._[0]].command(argv);
}

process.on('uncaughtException', function(err) {
  logger.error(err.message);
  process.exit(0);
});
