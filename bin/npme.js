#!/usr/bin/env node

var adminCommand = 'replicated admin '
var chalk = require('chalk')
var fs = require('fs')
var path = require('path')
var request = require('request')
var spawn = require('child_process').spawn
var cwd = path.resolve(__dirname, '../')

var argv = require('yargs')
  .usage('$0 [command] [arguments]')
  .help('h')
  .alias('h', 'help')
  .command('install', 'install the npm on-site appliance', install)
  .command('ssh', 'ssh into the npm on-site appliance', ssh)
  .command('add-package', 'add a package to your whitelist', addPackage)
  .command('reset-follower', 'reset the public registry follower', resetFollower)
  .command('update-license', 'update the license associated with your npm on-site appliance', updateLicense)
  .option('sudo', {
    alias: 's',
    description: 'should shell commands be run as sudo user',
    boolean: true,
    default: true
  })
  .example('$0 add-package lodash', 'add the lodash package to your whitelist')
  .demand(1, 'you must provide a command to run')
  .argv

// install the replicated appliance.
function install (yargs, argv) {
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
}

function addPackage (yargs, argv) {
  exec(adminCommand + argv._.join(' '), argv.sudo, function () {})
}

function resetFollower (yargs, argv) {
  exec(adminCommand + argv._.join(' '), argv.sudo, function () {})
}

function updateLicense (yargs, argv) {
  exec(adminCommand + argv._.join(' '), argv.sudo, function () {})
}

function ssh (yargs, argv) {
  exec(adminCommand + argv._.join(' '), argv.sudo, function () {})
}

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
