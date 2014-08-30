var Lab = require('lab'),
  lab = exports.lab = Lab.script(),
  License = require('../lib/license'),
  nock = require('nock');

lab.experiment('License', function() {

  lab.experiment('validateLicense', function() {
    lab.it('returns an invalid license error if response is an error', function(done) {
      var license = new License({
        userEmail: 'ben@example.com', // email of user to validate license for.
        licenseKey: 'fake-key'
      });

      var licenseApi = nock('https://license.npmjs.com')
        .get('/b7e73bbc-ee47-45fa-b62d-4282a9e29f97/ben@example.com/fake-key')
        .reply(404);

      license.validateLicense(function(err) {
        Lab.expect(err.message).to.eql('invalid license');
        done();
      });
    });
  });

  lab.it('it sets the license instance variable equal to response if license is valid', function(done) {
    var license = new License({
      userEmail: 'ben@example.com', // email of user to validate license for.
      licenseKey: 'fake-key'
    });

    var licenseApi = nock('https://license.npmjs.com')
      .get('/license/b7e73bbc-ee47-45fa-b62d-4282a9e29f97/ben@example.com/fake-key')
      .reply(200, JSON.stringify({apple: 404}));

    license.validateLicense(function(err) {
      Lab.expect(license.license.apple).to.eql(404);
      done();
    });
  });
});
