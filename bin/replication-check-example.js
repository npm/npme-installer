#!/usr/bin/env node
var follow = require('../lib/replication-check.js')

var stream = follow(function(data,cb){
  console.log(data)
  cb()
},{
  check:'https://replicate.npmjs.com/registry',
  scan:'https://skimdb.npmjs.com/registry'
})

setInterval(function(){
  console.log(stream.sequence)
},5000).unref()
