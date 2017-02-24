var ccf = require('concurrent-couch-follower')
var request = require('request')
var retry = require('./retry-thing.js')
var downloadTar = require('./download-tar.js')
var normalize = require('normalize-registry-metadata')


//
// config.scan we stream all the documents in this database
// config.check we request each doc in the stream from scan to see if check has the same versions
//

module.exports = function(handler,config) {
  if(!config.scan || !config.check) {
    throw new Error('please pass a db to scan and a primary to check against')
  }

  var endSeq
  updateSeq(config.scan,function(err,seq){
    if(!seq) throw new Error('failed to read sequence id from primary '+config.primary+'\n'+err)

    endSeq = seq
    console.log('ending at sequence ',endSeq)
  })

  var ended = false

  var stream =  ccf(function(data,cb){
    var doc = normalize(data.doc)
    // not a package.
    if(!doc) return cb()
    if(ended) return cb()

    if(data.seq >= endSeq) {
      ended = true
      console.log('reached '+endSeq+' done')
      stream.end()
    }

    var scanVersions = Object.keys(doc.versions)

    fetchPackage(config.check,data.doc.name,function(err,checkDoc){

      var output = {
        name:doc.name,
        versions:[],
        scan:data.doc,
        check:checkDoc
      }

      if(err) {
        output.error = err
        if(err.statusCode === 404) {
          // no action probably. but send to the handler for logging?
          // output.missing = true
          return cb()
        }

        handler(output,cb)
        return
      }

      Object.keys(checkDoc.versions||{}).forEach(function(version){
        if(!doc.versions[version]){
          output.versions.push(version) 
        }
      })
      
      if(output.versions.length) {
        return handler(output,cb)
      }

      // nothing wrong.
      cb()

    })
  },{
    db:config.scan,
    since:0,
    include_docs:true,
    sequence:function(seq,cb){
      // dont save sequence.
      stream.sequence = seq
      cb()
    }
  })

  stream.on('error',function(err){
    if((err+'').indexOf('premature')> -1) {
      console.log('[error] unexpected error on scan stream.')
    }
  })

  return stream
}

module.exports.repairVersions = function(options,cb){

  var scanDb = options.db
  var oldDoc = options.oldDoc // replica
  var checkDoc = options.currentDoc // primary
  var versions = options.versions
  var tarHost = options.tarHost
  var ignore404 = options.ignore404
  var dataDir = options.dataDirectory


  var count = versions.length
  versions.forEach(function(v){
    var versionDoc = checkDoc.versions[v]||{}
    var tarball = (versionDoc.dist||{}).tarball
    var shasum = (versionDoc.dist||{}).shasum

    if(!tarball) {
      return finished(new Error(tarball))
    }

    if(tarHost){
      if(tarHost.indexOf('://') === -1) {
        tarHost = 'http://'+tarHost
      }

      var parsed = url.parse(tarball)
      var hostParsed = url.parse(tarHost)
      parsed.host = hostParsed.host

      parsed.protocol = hostParsed.protocol

      tarball = url.format(parsed)

    } 

    retry(function(done){
      downloadTar(checkDoc.name,tarball,shasum,dataDir,done)
    },4,function(err,data){
      // if the tarball gets a 404 after retries im going to consider this not an error
      finished(err,data)
    })
  })

  var errors = 0
  var report = {}
  function finished(err,tar){
    if(err) {
      report[tar] = 'error: '+err
      if(!ignore404 || err.statusCode !== 404){
        errors++
      }
    }
    if(!--count) {
      if(errors.length){
        var e = new Error('error downloading tarballs. see err.report. '+Object.keys(report).join(', '))
        e.report = report;
        return cb(e) 
      }
      checkDoc._rev = oldDoc._rev
      putPackage(scanDb,checkDoc,cb)
    }
  }
}


function updateSeq(db,cb){
  request(db,function(err,body,data){
    cb(err,(json(data)||{}).update_seq)
  })
}

function fetchPackage(db,name,cb){
  request({url:db+'/'+name.replace('/','%2f'),timeout:10000},function(err,res,body){
    if(err) return cb(err)
    if(res.statusCode !== 200) {
      var e = new Error('status code '+res.statusCode)
      e.statusCode = res.statusCode
      return cb(e)
    }

    var obj = json(body)
    if(!obj) return new Error('invalid json returned. '+(body+'').substr(0,200))

    cb(false,obj)

  })
}

module.exports.putPackage = putPackage

function putPackage(db,doc,cb){
  request.put({
    url:db+'/'+doc.name.replace('/','%2f'),
    headers:{
      'content-type':'application/json'
    },
    body:JSON.stringify(doc)
  },function(err,res,body){
    if(err) return cb(err)

    console.log(err,res.statusCode,body+'')

    var obj = json(body)
    if(!obj.ok) return cb(new Error('did not get ok respond from couchdb. '+body))

    //yay
    cb() 
  })
}

function json(o){
  try{
    return JSON.parse(o)
  }catch(e){}
}
