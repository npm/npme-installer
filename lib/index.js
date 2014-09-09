var async = require('async'),
  inquirer = require('inquirer'),
  logger = require('./logger'),
  License = require('./license'),
  path = require('path'),
  Platform = require('./platform'),
  util = new (require('../lib/util'))();

module.exports = function(args) {
  var license = null,
    sudo = true,
    user = 'ubuntu',
    group = 'ubuntu';

  async.series([
    function(next) {
      // make sure the user understands that they're
      // about to nuke a bunch of things.
      inquirer.prompt({
        name: 'confirm',
        message: "this will install npmE on this server (you should only run this on a dedicated machine), continue?",
        type: 'confirm'
      }, function(answers) {
        if (answers.confirm) return next();
        else throw Error('aborted install')
      });
    },
    function(next) {
      // grab a user's email and license key.
      inquirer.prompt([
        {
          name: 'userEmail',
          message: "enter your billing email"
        },
        {
          name: 'licenseKey',
          message: "enter your license key"
        },
        {
          name: 'user',
          message: "what user should npmE run as",
          default: 'npme'
        },
        {
          name: 'group',
          message: "what group should npmE run as",
          default: "npme"
        },
        {
          name: 'sudo',
          message: "should privileged commands be run using sudo (usually the answer is yes)",
          type: 'confirm'
        }
      ], function(answers) {
        // store answers.
        license = new License({
          userEmail: answers.userEmail,
          licenseKey: answers.licenseKey
        });

        sudo = answers.sudo;
        user = answers.user;
        group = answers.group;

        license.validateLicense(function(err) {
          if (err) throw err;
          else return next();
        });
      });
    },
    function(next) {
      var command = 'ln -s --force ' + path.resolve('../.bin/npme') + ' /usr/bin/npme';

      if (sudo) command = 'sudo ' + command;

      util.exec(command, {}, function(err) { next(); });
    },
    function(next) {
      // detect platform, and run the
      // appropriate installer.
      (new Platform())(function(platform) {
        platform({
          userEmail: license.userEmail,
          licenseKey: license.licenseKey,
          productId: license.productId,
          license: license.license,
          user: user,
          group: group,
          sudo: sudo
        });

        return next();
      });
    }
  ], function(err) {
    if (err) logger.error(error.message);
  });
};
