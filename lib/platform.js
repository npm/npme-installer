// detect the platform that the install
// is being run on, and execute the appropriate
// bootstrapping module.
var _ = require('lodash'),
  getos = require('getos');

function Platform(opts) {
  var _this = this;

  _.extend(this, {
    default: require('npme-trusty'),
    getos: require('getos'),
    platforms: {
      'trusty_14.04': require('npme-trusty'),
      'final_6.5': require('npme-centos65')
    }
  }, opts);

  return function(cb) {
    _this.getos(function(err, os) {
      if (err) return cb(_this.default);
      else {
        var platformKey = os.codename + '_' + os.release;
        if (_this.platforms[platformKey]) return cb(_this.platforms[platformKey]);
        else return cb(_this.default);
      }
    });
  }
}

module.exports = Platform;
