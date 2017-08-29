
var mkdirp = require('mkdirp')
var fs = require('fs')
var request = require('request')
var path = require('path')
var mis = require('mississippi')
var once = require('once')
var crypto = require('crypto')

module.exports = function (name, tarball, shasum, dir, sharedFetchSecret, cb) {
  cb = once(cb)

  var basename = path.basename(tarball)
  var targetDir = path.join(dir, name[0], name, '_attachments')
  var targetName = path.join(targetDir, basename)

  fs.exists(targetName, function (exists) {
    if (exists) return cb(false, tarball)

    reallyDownload(tarball, targetDir, targetName, shasum, sharedFetchSecret, function (err) {
      cb(err, tarball)
    })
  })
}

function reallyDownload (tarUrl, targetDir, targetName, shasum, sharedFetchSecret, cb) {
  mkdirp(targetDir, function (err) {
    if (err) return cb(err)

    var tmpname = targetName + '.tmp'

    var responded = false

    var hash = crypto.createHash('sha1')

    var opts = {
      method: 'GET',
      url: tarUrl
    }

    console.info('attempt to download ' + tarUrl)

    if (sharedFetchSecret) opts.qs = { sharedFetchSecret: sharedFetchSecret }

    var req = request(tarUrl)
    req.on('response', function (res) {
      responded = true
      if (res.statusCode !== 200) {
        var e = new Error()
        e.statusCode = res.statusCode
        return cb(e)
      }

      mis.pipe(res, mis.through(function (chunk, enc, cb) {
        hash.update(chunk)
        cb(false, chunk)
      }), fs.createWriteStream(tmpname), function (err) {
        if (err) {
          console.error('failed downloading ' + tarUrl + ' err = ' + err.message)
          return cb(err)
        }

        var resultShasum = hash.digest().toString('hex')

        if (resultShasum !== shasum) {
          return cb(new Error('shasum mismatch got: ' + resultShasum + ' need ' + shasum))
        }

        fs.rename(tmpname, targetName, function (err) {
          // yay! all done.
          console.info('finished downloading ' + tarUrl)
          cb(err, tarUrl)
        })
      })
    }).on('error', function (err) {
      if (!responded) cb(err)
    })
  })
}
