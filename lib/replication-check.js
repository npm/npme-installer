var ccf = require('concurrent-couch-follower')
var request = require('request')

//
// config.scan we stream all the documents in this database
// config.check we request each doc in the stream from scan to see if check has the same versions
//
//

module.exports = function(handler,config) {
  if(!config.scan || !config.check){
    throw new Error('please pass primary and replica')
  }

  var endSeq
  updateSeq(config.scan,function(err,seq){
      if(!seq) throw new Error('failed to read sequence id from primary '+config.primary+'\n'+err)

      endSeq = seq
      console.log('ending at sequence ',endSeq)
  })

  var ended = false

  var stream =  ccf(function(data,cb){
    var doc = data.doc||{}
    // not a package.
    if(!doc.name) return cb()

    if(ended) return cb()

    if(data.seq >= endSeq) {
      ended = true
      console.log('reached '+endSeq+' done')
      stream.end()
      return cb()
    }

    var scanVersions = Object.keys(doc.versions)

    fetchPackage(config.check,data.doc.name,function(err,checkDoc){

      var checkVersions = Object.keys(checkDoc.versions)

      var output = {
        name:doc.name,
        versions:[],
        primary:data.doc, // extras justy in case
        replica:checkDoc // extras just in case
      }

      if(err) {
        output.error = err
        if(err.statusCode === 404) {
          // no action probably. but sending to the handler for logging.
          output.missing = true
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
      e.code = 'ESTATUS'
      e.statusCode = res.statusCode
      return cb(e)
    }

    var obj = json(body)
    if(!obj) return new Error('invalid json returned. '+(body+'').substr(0,200))

    cb(false,obj)

  })
}


function json(o){
  try{
    return JSON.parse(o)
  }catch(e){}
}
