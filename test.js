var W = require('./')

function asyncF(result, fail, cb) {
    if (fail) {
        cb(fail)
    } else {
        cb(null, result)
    }
}

function doneF(err, result) {
    if (err) {
        console.log('Err', err)
    } else {
        console.log(result)
    }
}

W(function (cb) {
    cb(null, '1 some val')
}).then(function (val, cb) {
    asyncF(val, null, cb)
}).done(doneF)

W(function (cb) {
    cb('err 2')
}).then(function (val, cb) {
    // Never reached
}).done(doneF)

W(function (cb) {
    cb(null, 'val')
}).then(function (val, cb) {
    asyncF('ok', 'fail 3', function (err, val) {
        if (err) return cb(err)
        cb(null, val)
    })
}).done(doneF)

W(function (cb) {
    cb(null, 'val')
}).then(function (val, cb) {
    asyncF('ok', 'fail 4', function (val) {
        cb(null, val)
    }.passerr(cb))
}).done(doneF)

W(function (cb) {
    cb('done', 'good 5')
}).then(function (val, cb) {
    // Never reached
}).done(doneF)
