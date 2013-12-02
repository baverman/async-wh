'use strict';

var assert = require('assert')

var asynch = require('./')

it('thenp should take prevous return value as argument', function (done) {
    asynch(function (cb) {
        cb(null, 'val')
    }).thenp(function (val, cb) {
        assert.equal(val, 'val')
        cb()
    }).done(done)
})

it('thenp should take several return values as arguments', function (done) {
    asynch(function (cb) {
        cb(null, 'val1', 'val2')
    }).thenp(function (val1, val2, cb) {
        assert.equal(val1, 'val1')
        assert.equal(val2, 'val2')
        cb()
    }).done(done)
})

it('thenp should take callback as last argument', function (done) {
    asynch(function (cb) {
        cb(null, 'val1', 'val2')
    }).thenp(function (cb) {
        cb(null, 'boo', 'foo')
    }).thenp(function (boo, cb) {
        cb(null, boo, 'bar')
    }).donep(function (err, boo, bar) {
        assert.equal(boo, 'boo')
        assert.equal(bar, 'bar')
        done()
    })
})

it('then/done should take result as argument', function (done) {
    asynch('boo', function (cb) {
        cb(null, 'val')
    }).then(function (result, cb) {
        assert.equal(result.boo, 'val')
        cb()
    }).done(function (err, result) {
        assert.equal(result.boo, 'val')
        done()
    })
})

it('unnamed then/thenp should go to _prev', function (done) {
    asynch(function (cb) {
        cb(null, 'val')
    }).then(function (result, cb) {
        assert.equal(result._prev, 'val')
        cb()
    }).done(done)
})

it('"done" error should return null error in donep', function (done) {
    asynch(function (cb) {
        cb('done', 'val')
    }).then(function (result, cb) {
        assert(false, 'skip')
        cb()
    }).donep(function (err, val) {
        assert.ifError(err)
        assert.equal(val, 'val')
        done()
    })
})

it('"done" error should return null error in done', function (done) {
    asynch(function (cb) {
        cb('done', 'val')
    }).then(function (result, cb) {
        assert(false, 'skip')
        cb()
    }).done(function (err, result) {
        assert.ifError(err)
        assert.equal(result._prev, 'val')
        done()
    })
})
