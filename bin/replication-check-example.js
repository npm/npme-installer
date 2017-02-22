var follow = require('../lib/replication-check.js')

var stream = follow(function(data,cb){
  console.log(data)
  cb()
},{
  primary:'https://replicate.npmjs.com/registry',
  replica:'https://skimdb.npmjs.com/registry'
})

setInterval(function(){
  console.log(stream.sequence)
},5000).unref()
