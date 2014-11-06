// useful helpers for bootstrapping npmE install.
var _ = require('lodash'),
  request = require('request');

function License(opts) {
  _.extend(this, {
    userEmail: null, // email of user to validate license for.
    licenseKey: null, // uuid of license to validate.
    productId: 'b7e73bbc-ee47-45fa-b62d-4282a9e29f97',
    apiEndpoint: 'https://license.npmjs.com/license',
    license: null, // the signed license returned by the license API.
    logger: require('./logger'),
    inquirer: require('inquirer'),
    fs: require('fs')
  }, opts)
}

// /license/:productKey/:billingEmailOrID/:licensekey
// see the spec in the servers repo.
//
// returns error on non-200 return,
// returns signed license otherwise.
License.prototype.validateLicense = function(cb) {
  var _this = this;
  request.get({
    url: this.apiEndpoint + '/' + this.productId + '/' + this.userEmail + '/' + this.licenseKey,
    json: true
  }, function (err, resp, body) {
    if (err || resp.statusCode >= 400) return cb(Error('invalid license'));
    else {
      _this.license = body;
      return cb(null, body);
    }
  });
};

License.prototype.interview = function(cb) {
  var _this = this;

  // grab a user's email and license key.
  this.inquirer.prompt([
    {
      name: 'userEmail',
      message: "enter your billing email"
    },
    {
      name: 'licenseKey',
      message: "enter your license key"
    }
  ], function(answers) {
    // store answers.
    _this.userEmail = answers.userEmail;
    _this.licenseKey = answers.licenseKey;

    _this.validateLicense(function(err) {
      if (err) throw err;
      else return cb();
    });
  });
};

License.prototype.update = function(cb) {
  var _this = this;

  this.interview(function() {
    _this.fs.writeFileSync('/etc/npme/.license.json', JSON.stringify(_this.license, null, 2));
    return cb();
  });
};

module.exports = License;
