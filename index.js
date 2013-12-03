'use strict';

var async = require('async')

Function.prototype.passerr = function (cb, thisobj) {
    var fn = this
    return function () {
        var args = Array.prototype.slice.call(arguments, 1)
        if (err) {
            cb(err)
        } else {
            fn.apply(thisobj, args)
        }
    }
}

Function.prototype.throwerr = function (thisobj) {
    var fn = this
    return function (err) {
        var args = Array.prototype.slice.call(arguments, 1)
        if (err) {
            throw(err)
        } else {
            fn.apply(thisobj, args)
        }
    }
}

var asynch = module.exports = function asynch(name, fn) {
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

            if (name) {
                result[name] = value
            }

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
        parallel: function (name, fn) {
            if (!fn) {
                fn = name
                name = null
            }
            ptasks.push(function (cb) {
                fn.apply(null, makeArgs(fn, makeCallbackWrapper(name, false, cb), false))
            })
            return this
        },
        donep: function (fn) {
            done = function (err) {
                var args = Array.prototype.slice.call(prevvalue)
                args.unshift(err)
                fn.apply(null, args)
            }
        },
        done: function (fn) {
            done = function (err) {
                fn(err, result)
            }
        }
    }

    if (name) {
        obj.thenp(name, fn)
    }

    process.nextTick(function () {
        if (ptasks.length) {
            ptasks.push(function (cb) {
                async.series(stasks, function (err) {
                    if (err === 'done') err = null
                    cb(err)
                })
            })
            async.parallel(ptasks, function (err) {
                done(err)
            })
        } else {
            async.series(stasks, function (err) {
                if (err === 'done') err = null
                done(err)
            })
        }
    })

    return obj
}

asynch.parallel = function (name, fn) {
    return asynch().parallel(name, fn)
}
