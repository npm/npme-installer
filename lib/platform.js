// detect the platform that the install
// is being run on, and execute the appropriate
// bootstrapping module.
var _ = require('lodash');

function Platform(platform, opts) {
  var _this = this;

  _.extend(this, {
    default: function(opts) { require('npme-unknown')(opts); },
    getos: require('getos'),
    platforms: {
      'trusty_14.04': function(opts) { require('npme-trusty')(opts); },
      'final_6.6': function(opts) { require('npme-centos65')(opts); },
      'final_6.5': function(opts) { require('npme-centos65')(opts); },
      'final_6.4': function(opts) { require('npme-centos65')(opts); }
    }
  }, opts);

  return function(cb) {
    _this.getos(function(err, os) {
      if (err) return cb(_this.default);
      else {
        var platformKey = platform || (os.codename + '_' + os.release);
        if (_this.platforms[platformKey]) return cb(_this.platforms[platformKey]);
        else return cb(_this.default);
      }
    });
  }
}

module.exports = Platform;
