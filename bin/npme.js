#!/usr/bin/env node

var argv = require('yargs')
  .help('h')
  .alias('h', 'help')
  .option('sudo', {
    alias: 's',
    description: 'should shell commands be run as sudo user',
    boolean: true,
    default: true
  })
  .argv
var chalk = require('chalk')
var fs = require('fs')
var path = require('path')
var request = require('request')
var spawn = require('child_process').spawn

var cwd = path.resolve(__dirname, '../')

exec('cp replicated-license-retrieval.json /etc', argv.sudo, function () {
  request.get('https://get.replicated.com', function (err, res, content) {
    if (err) {
      console.log(chalk.red(err.message))
      return
    }

    fs.writeFileSync(path.resolve(cwd, './install.sh'), content, 'utf-8')

    exec('sh install.sh', argv.sudo, function () {
      console.log(chalk.bold.green('Congrats! Your npm on-site server is now up and running \\o/'))
      console.log(chalk.bold('\nThere are just a few final steps:\n'))
      ;[
        'Access your server via HTTPS on port 8800',
        'Proceed passed the HTTPS connection security warning (a selfsigned cert is being used initially)',
        'Upload a custom TLS/SSL cert/key or proceed with the provided self-signed pair.',
        'Configure your npm instance & click "Save".',
        'Visit https://docs.npmjs.com/, for information about using npm on-site or contact support@npmjs.com'
      ].forEach(function (s, i) {
        console.log(chalk.bold('Step ' + (i + 1) + '.') + ' ' + s)
      })
    })
  })
})

function exec (command, sudo, cb) {
  var commands = ['-c']
  if (sudo) command = 'sudo ' + command
  commands.push(command)

  var proc = spawn('sh', commands, {
    cwd: cwd,
    env: process.env,
    stdio: 'inherit'
  })

  proc.on('close', function (output) {
    cb()
  })
}

process.on('uncaughtException', function (err) {
  console.log(chalk.red(err.message))
  process.exit(0)
})
