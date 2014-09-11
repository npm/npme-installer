var Lab = require('lab'),
  lab = exports.lab = Lab.script(),
  Platform = require('../lib/platform');

lab.experiment('Platform', function() {


  lab.experiment('getos', function() {

    lab.it('allows platform to be overridden', function(done) {
      (new Platform('trusty_14.04', {
        getos: function(cb) {
          cb(null, { os: 'linux', dist: 'Centos', release: '6.5', codename: 'final' });
        }
      }))(function(platform) {
        Lab.expect(platform.toString()).to.match(/npme-trusty/) // story checks out, we're running apt.
        done();
      });
    });

    lab.it('returns default platform if getos returns an error', function(done) {
      (new Platform(null, {
        getos: function(cb) {
          cb(Error('not found'));
        }
      }))(function(platform) {
        Lab.expect(platform.toString()).to.match(/npme-unknown/) // story checks out, we're running apt.
        done();
      });
    });

    lab.it('returns centos installer if codename = latest and release = 6.5', function(done) {
      (new Platform(null, {
        getos: function(cb) {
          cb(null, { os: 'linux', dist: 'Centos', release: '6.5', codename: 'final' });
        }
      }))(function(platform) {
        Lab.expect(platform.toString()).to.match(/npme-centos65/) // story checks out, we're running apt.
        done();
      });
    });

    lab.it('returns trusty installer if platform is trusty', function(done) {
      (new Platform(null, {
        getos: function(cb) {
          cb(null, { os: 'linux', dist: 'Ubuntu Linux', codename: 'trusty', release: '14.04' });
        }
      }))(function(platform) {
        Lab.expect(platform.toString()).to.match(/npme-trusty/) // story checks out, we're running apt.
        done();
      });
    });

    lab.it('returns default installer if platform is unknown', function(done) {
      (new Platform(null, {
        getos: function(cb) {
          cb(null, { os: 'linux', dist: 'Ubuntu Linux', codename: 'blargy', release: '14.04' });
        }
      }))(function(platform) {
        Lab.expect(platform.toString()).to.match(/npme-unknown/) // story checks out, we're running apt.
        done();
      });
    });

  });

});
