var checkForUpdate = require('./check-for-update')
var path = require('path')
var spawn = require('child_process').spawn
var which = require('which')

var adminCommand = 'replicated admin '
try {
  which.sync('replicated')
} catch (err) {
  if (err.code === 'ENOENT') adminCommand = 'docker exec -it replicated replicated admin '
}

exports.adminCommand = adminCommand

var cwd = exports.cwd = path.resolve(__dirname, '../')

var exec = exports.exec = function (command, sudo, cb) {
  var commands = ['-c']
  if (sudo) command = 'sudo -E ' + command
  commands.push(command)

  var proc = spawn('sh', commands, {
    cwd: cwd,
    env: process.env,
    stdio: 'inherit'
  })

  proc.on('close', function (code) {
    cb(code)
  })
}

var command = exports.command = function (filename) {
  return path.basename(filename, path.extname(filename))
}

var defaultBuilder = exports.defaultBuilder = function (cmd) {
  return function (yargs) {
    if (cmd.usage) yargs.usage(cmd.usage)
    if (cmd.options) yargs.options(cmd.options)
    if (cmd.demand) {
      if (cmd.demandDesc) yargs.demand(cmd.demand, cmd.demandDesc)
      else yargs.demand(cmd.demand)
    }
    if (cmd.epilog) yargs.epilog(cmd.epilog)
    return yargs
  }
}

var defaultHandler = exports.defaultHandler = function () {
  return function (argv) {
    exec(adminCommand + argv._.join(' '), argv.sudo, function () {})
  }
}

exports.decorate = function (cmd, filename) {
  if (!cmd.command && filename) cmd.command = command(filename)
  if (!cmd.usage) cmd.usage = '$0 ' + cmd.command + ' [opts]'
  if (cmd.desc && !cmd.epilog) cmd.epilog = cmd.desc
  if (!cmd.builder) cmd.builder = defaultBuilder(cmd)
  if (!cmd.handler) cmd.handler = defaultHandler()

  var builder = cmd.builder
  cmd.builder = function (yargs) {
    checkForUpdate()
    return builder(yargs)
  }

  return cmd
}
