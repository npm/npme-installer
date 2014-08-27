var _ = require('lodash'),
  chalk = require('chalk'),
  util = require('util');

exports.log = function() {
  console.log.apply(this, arguments);
}

exports.success = function() {
  console.log.apply(this, _.map(arguments, function(arg) {
    if (typeof arg === 'object') return chalk.green(util.inspect(arg));
    else return chalk.green(arg);
  }));
}

exports.warn = function() {
  console.log.apply(this, _.map(arguments, function(arg) {
    if (typeof arg === 'object') return chalk.yellow(util.inspect(arg));
    else return chalk.yellow(arg);
  }));
}

exports.error = function() {
  console.log.apply(this, _.map(arguments, function(arg) {
    if (typeof arg === 'object') return chalk.red(util.inspect(arg));
    else return chalk.red(arg);
  }));
}
