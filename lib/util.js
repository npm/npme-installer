// useful helpers for bootstrapping npmE install.
var _ = require('lodash'),
  spawn = require('child_process').spawn;

function Util(opts) {
  _.extend(this, {
    logger: require('./logger')
  }, opts)
}

Util.prototype.exec = function(command, opts, cb) {
  var _this = this,
    spawnOpts = {
      cwd: './',
      env: process.env,
      stdio: [process.stdin, process.stdout, process.stderr]
    };

  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  spawnOpts = _.extend(spawnOpts, opts)

  var proc = spawn('sh', ['-c', command], spawnOpts);

  proc.on('close', function(output) {
    cb();
  });
};

module.exports = Util;
