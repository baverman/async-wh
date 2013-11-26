var async = require('async')
  , fs = require('fs')

require('./')

async.w(function (cb) {
    cb(null, '/tmp')
}).then(function (dir, cb) {
    fs.readdir(dir, cb)
}).done(function (err, result) {
    console.log(result)
})
