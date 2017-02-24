var utils = require('../lib/utils')
var follow = require('../lib/replication-check.js')

var cmd = {
  desc: "run maintenance against a CouchDB server (make sure it's packages are up-to-date)"
}

cmd.builder = function (yargs) {
  yargs
    .option('check', {
      describe: 'we request each doc in the stream from scan to see if check has the same versions (the primary).\nexample: https://theprimary:8080',
      demand: true
    })
    .option('scan', {
      describe: 'we stream all the documents in this database (the replica).\nexample: http://172.17.0.1:5984/registry\nyou can find this by running `sudo docker ps | grep klaemo | sed \'s/->/ /\' | awk \'{print $(NF-2)}\'`',
      demand: true
    })
    .option('data-directory', {
      describe: 'data directory to store missing tarballs',
      default: '/usr/local/lib/npme/packages'
    })
    .option('tar-host',{
      describe:"download tarballs from this host instead of the external url for your npme. most likely the host you use for `check`. example: https://theprimary:8080",
      default:false
    })
    .option('dry-run',{
      describe:"only print packages that are missing versions instead of attempting to repair them",
      default:false
    })
    //.option('ignore-404',{
    //  describe:"you may want to update the document with new versions even if the tarball cannot be found.",
    //  default: false
    //})
}

cmd.handler = function (argv) {

  //process.removeListener('UncaughtException')
  console.log(argv)

  var stream = follow(function(data,cb){
    var message = data.name+'\t'+JSON.stringify(data.versions)

    if(argv.dryRun) {
      console.log(message)
      return cb()
    }

    cb = timerwrap(cb)

    follow.repairVersions({
      db: argv.scan,
      oldDoc: data.scan,
      currentDoc: data.check,
      versions: data.versions,
      tarHost: argv.tarHost,
      dataDirectory: argv.dataDirectory
    },function(err,data){
      if(err) {
        message += "\terror. "+err
      } else {
        message += "\trepaired!"
      }

      console.log(message)

      cb()
    })

  },{
    check: argv.check,
    scan: argv.scan
  })

  setInterval(function(){
    console.log(stream.sequence)
  },5000).unref()
}

module.exports = utils.decorate(cmd, __filename)


function timerwrap(cb){
  var timer
  return wrapped
  function wrapped(){
    clearTimeout(timer)
    cb.apply(this,arguments)
  }
  setTimeout(function(){
    wrapped() 
  },60000)
}
