// useful helpers for bootstrapping npmE install.
var _ = require('lodash'),
  fs = require('fs'),
  request = require('request');

function License(opts) {
  _.extend(this, {
    userEmail: null, // email of user to validate license for.
    licenseKey: null, // uuid of license to validate.
    productId: 'b7e73bbc-ee47-45fa-b62d-4282a9e29f97',
    apiEndpoint: 'https://license.npmjs.com/license',
    license: null, // the signed license returned by the license API.
    logger: require('./logger')
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

//
// Phone home with install information.
License.prototype.phoneHome = function(cb) {
  var _this = this;
  request.post({
    url: this.apiEndpoint + '/' + this.productId + '/' + this.userEmail + '/' + this.licenseKey + '/activated',
    json: true
  }, function (err, resp, body) {
    if (err || resp.statusCode >= 400) return cb(Error('failed to activate'));
    else {
      return cb(null, body);
    }
  });
};

module.exports = License;
