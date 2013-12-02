'use strict';

var async = require('async')

Function.prototype.passerr = function (cb, thisobj) {
    var fn = this
    return function () {
        var args = Array.prototype.slice.call(arguments)
        var err = args.shift()
        if (err) {
            cb(err)
        } else {
            fn.apply(thisobj, args)
        }
    }
}

module.exports = function asynch() {
    var stasks = []
    var ptasks = []
    var result = {}
    var done
    var prevvalue = [null]
    var anynames = false

    function makeCallbackWrapper(name, saveInPrev, cb) {
        return function (err) {
            var value = Array.prototype.slice.call(arguments, 1)

            if (saveInPrev) {
                prevvalue = value
            }

            if (value.length === 1) {
                value = value[0]
            }

            result[name] = value

            cb(err)
        }
    }

    function makeArgs(fn, cb, usePrev) {
        var len = fn.length - 1
        if (len < 0) len = 0

        var args
        if (usePrev) {
            args = prevvalue
        } else {
            args = [result]
        }
        
        args = Array.prototype.slice.call(args, 0, len)
        args.push(cb)
        return args
    }

    var obj = {
        thenp: function (name, fn) {
            if (!fn) {
                fn = name
                name = '_prev'
            }
            stasks.push(function (cb) {
                fn.apply(null, makeArgs(fn, makeCallbackWrapper(name, true, cb), true))
            })
            return this
        },
        then: function (name, fn) {
            if (!fn) {
                fn = name
                name = '_prev'
            }
            stasks.push(function (cb) {
                fn.apply(null, makeArgs(fn, makeCallbackWrapper(name, true, cb), false))
            })
            return this
        },
        donep: function (fn) {
            done = function (err) {
                var args = Array.prototype.slice.call(prevvalue)
                if (err === 'done') err = null
                args.unshift(err)
                fn.apply(null, args)
            }
        },
        done: function (fn) {
            done = function (err) {
                if (err === 'done') err = null
                fn(err, result)
            }
        }
    }

    obj.thenp.apply(obj, arguments)

    process.nextTick(function () {
        async.series(stasks, done)
    })

    return obj
}
