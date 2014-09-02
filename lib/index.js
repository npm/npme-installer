var async = require('async'),
  inquirer = require('inquirer'),
  logger = require('./logger'),
  License = require('./license'),
  platforms = {
    trusty: require('npme-trusty')
  };

module.exports = function(arguments) {
  var license = null;

  async.series([
    function(next) {
      // make sure the user understands that they're
      // about to nuke a bunch of things.
      inquirer.prompt({
        name: 'confirm',
        message: "This will install npmE's OS-dependencies (CouchDB, Nginx, etc). Only run on a new server image. Continue?",
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
        }
      ], function(answers) {
        license = new License({
          userEmail: answers.userEmail,
          licenseKey: answers.licenseKey
        });

        license.validateLicense(function(err) {
          if (err) throw err;
          else return next();
        });
      });
    },
    function(next) {
      // run our trusty install step.
      platforms.trusty({
        userEmail: license.userEmail,
        licenseKey: license.licenseKey,
        productId: license.productId,
        license: license.license
      });
      return next();
    }
  ], function(err) {
    if (err) logger.error(error.message);
  });
};
