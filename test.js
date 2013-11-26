var W = require('./')
  , fs = require('fs')

W(function (cb) {
    cb(null, '/tmp')
}).then(function (dir, cb) {
    fs.readdir(dir, cb)
}).done(function (err, result) {
    console.log(result)
})
