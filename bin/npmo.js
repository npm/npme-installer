#!/usr/bin/env node

var adminCommand = 'replicated admin '
var chalk = require('chalk')
var fs = require('fs')
var path = require('path')
var publicIp = require('public-ip')
var request = require('request')
var spawn = require('child_process').spawn
var cwd = path.resolve(__dirname, '../')

require('yargs')
  .usage('$0 [command] [arguments]')
  .help('h')
  .alias('h', 'help')
  .command('install', 'install the npm On-Site appliance', install)
  .command('ssh', 'ssh into the npm On-Site appliance', ssh)
  .command('add-package', 'add a package to your whitelist', addPackage)
  .command('remove-package', 'remove a package from your registry', removePackage)
  .command('reset-follower', 'reset the public registry follower', resetFollower)
  .command('update-license', 'update the license associated with your npm On-Site appliance', updateLicense)
  .command('manage-tokens', 'manage npm On-Site deploy tokens', manageTokens)
  .version(require('../package').version, 'v')
  .alias('v', 'version')
  .option('sudo', {
    alias: 's',
    description: 'should shell commands be run as sudo user',
    boolean: true,
    default: true
  })
  .option('release', {
    alias: 'r',
    description: 'what release of replicated should be used (defaults to stable)'
  })
  .example('$0 add-package lodash', 'add the lodash package to your whitelist')
  .demand(1, 'you must provide a command to run')
  .argv

// install the replicated appliance.
function install (yargs) {
  var argv = yargs
    .usage('$0')
    .option('sudo', {
      alias: 's',
      description: 'should shell commands be run as sudo user',
      boolean: true,
      default: true
    })
    .help('h')
    .alias('h', 'help')
    .epilog('install a brand new npm On-Site appliance')
    .argv

  exec('cp replicated-license-retrieval.json /etc', argv.sudo, function () {
    var release = argv.release ? '/' + argv.release : ''

    request.get('https://get.replicated.com' + release, function (err, res, content) {
      if (err) {
        console.log(chalk.red(err.message))
        return
      }

      fs.writeFileSync(path.resolve(cwd, './install.sh'), content, 'utf-8')

      exec('sh install.sh', argv.sudo, function (code) {
        if (code !== 0) {
          console.log(chalk.bold.red('oh no! something went wrong during the install...\r\n') +
            chalk.bold.red('contact ') +
            chalk.bold.green('support@npmjs.com ') +
            chalk.bold.red('and we can help get you up and running'))
        } else {
          exec('mkdir -p /etc/replicated/brand/', argv.sudo, function () {
            exec('cp -f brand.css /etc/replicated/brand/brand.css', argv.sudo, function () {})
          })

          console.log(chalk.bold.green('Congrats! Your npm On-Site server is now up and running \\o/'))
          console.log(chalk.bold('\nThere are just a few final steps:\n'))

          publicIp.v4(function (err, ip) {
            var accessMessage

            if (err) {
              accessMessage = 'Access this server in a web-browser via port 8800 (this will bring you to an admin console)'
            } else {
              accessMessage = 'Access this server in a web-browser at https://' + ip + ':8800 (this will bring you to an admin console)'
            }

            ;[
              accessMessage,
              'Proceed passed the HTTPS connection security warning (a self-signed cert is being used initially)',
              'Upload a custom TLS/SSL cert/key or proceed with the provided self-signed pair.',
              'Configure your npm instance & click "Save".',
              'Visit https://docs.npmjs.com/, for information about using npm On-Site or contact support@npmjs.com'
            ].forEach(function (s, i) {
              console.log(chalk.bold('Step ' + (i + 1) + '.') + ' ' + s)
            })
          })
        }
      })
    })
  })
}

function addPackage (yargs) {
  var argv = yargs
    .usage('$0 package-name[@version]')
    .option('sudo', {
      alias: 's',
      description: 'should shell commands be run as sudo user',
      boolean: true,
      default: true
    })
    .help('h')
    .alias('h', 'help')
    .epilog("add a new package to your appliance's whitelist")
    .argv

  var cmd = adminCommand + argv._.join(' ')
  if (~cmd.indexOf('@')) cmd += ' --all-versions=false'
  exec(cmd, argv.sudo, function () {})
}

function removePackage (yargs) {
  var argv = yargs
    .usage('$0 package-name')
    .option('sudo', {
      alias: 's',
      description: 'should shell commands be run as sudo user',
      boolean: true,
      default: true
    })
    .help('h')
    .alias('h', 'help')
    .epilog('remove a package from your registry')
    .argv

  exec(adminCommand + argv._.join(' '), argv.sudo, function () {})
}

function resetFollower (yargs) {
  var argv = yargs
    .usage('$0')
    .option('sudo', {
      alias: 's',
      description: 'should shell commands be run as sudo user',
      boolean: true,
      default: true
    })
    .help('h')
    .alias('h', 'help')
    .epilog('reset the sequence # of the public registry follower')
    .argv

  exec(adminCommand + argv._.join(' '), argv.sudo, function () {})
}

function updateLicense (yargs) {
  var argv = yargs
    .usage('$0')
    .option('sudo', {
      alias: 's',
      description: 'should shell commands be run as sudo user',
      boolean: true,
      default: true
    })
    .help('h')
    .alias('h', 'help')
    .epilog('update the license on your npm On-Site appliance')
    .argv

  exec(adminCommand + argv._.join(' '), argv.sudo, function () {})
}

function manageTokens (yargs) {
  var argv = yargs
    .usage('$0')
    .option('sudo', {
      alias: 's',
      description: 'should shell commands be run as sudo user',
      boolean: true,
      default: true
    })
    .help('h')
    .alias('h', 'help')
    .epilog('manage the tokens on your npm On-Site appliance')
    .argv

  exec(adminCommand + argv._.join(' '), argv.sudo, function () {})
}

function ssh (yargs) {
  var argv = yargs
    .usage('$0')
    .option('sudo', {
      alias: 's',
      description: 'should shell commands be run as sudo user',
      boolean: true,
      default: true
    })
    .help('h')
    .alias('h', 'help')
    .epilog('ssh into the npm On-Site appliance')
    .argv

  exec(adminCommand + argv._.join(' '), argv.sudo, function () {})
}

function exec (command, sudo, cb) {
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

process.on('uncaughtException', function (err) {
  // if there is no Internet connection
  // native-dns throws an uncaught ENOENT exception
  // let's ignore this.
  if (err.code === 'ENOENT') return
  console.log(chalk.red(err.message))
  process.exit(0)
})
