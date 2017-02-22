var ccf = require('concurrent-couch-follower')
var request = require('request')

module.exports = function(handler,config) {
  if(!config.primary || !config.replica){
    throw new Error('please pass primary and replica')
  }

  var endSeq
  updateSeq(config.primary,function(err,seq){
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

    fetchPackage(config.replica,data.doc.name,function(err,replicaDoc){
      var output = {
        versions:[],
        primary:data.doc,
        replica:replicaDoc
      }

      if(err){
        output.error = err
        if(err.statusCode === 404) {
          output.missing = true
        }

        handler(output,cb)
        return
      }

      var replicaVersions = Object.keys(replicaDoc.versions)
      Object.keys(doc.versions||{}).forEach(function(version){
        if(!replicaDoc.versions[version]){
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
    db:config.primary,
    since:0,
    include_docs:true,
    sequence:function(seq,cb){
      // dont save sequence.
      stream.sequence = seq
      cb()
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
