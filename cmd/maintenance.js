var utils = require('../lib/utils')
var follow = require('../lib/replication-check.js')

var cmd = {
  desc: "run maintenance against a CouchDB server (make sure it's packages are up-to-date)"
}

cmd.builder = function (yargs) {
  yargs
    .option('check', {
      describe: 'we request each doc in the stream from scan to see if check has the same versions (the primary)',
      demand: true
    })
    .option('scan', {
      describe: 'we stream all the documents in this database (the replica)',
      demand: true
    })
    .option('data-directory', {
      describe: 'data directory to store missing tarballs to',
      default: '/usr/local/lib/npme/packages'
    })
}

cmd.handler = function (argv) {
  console.log(argv)
  var stream = follow(function(data,cb){
    console.log(data)
    cb()
  },{
    check: argv.check,
    scan: argv.scan
  })

  setInterval(function(){
    console.log(stream.sequence)
  },5000).unref()
}

module.exports = utils.decorate(cmd, __filename)
