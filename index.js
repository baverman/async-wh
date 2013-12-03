'use strict';

var async = require('async')

Function.prototype.passerr = function (cb, thisobj) {
    var fn = this
    return function (err) {
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
    var chunks = []
    var currentChunk = null

    var result = {}
    var done
    var prevvalue = [null]

    function addTask(type, push, task) {
        if (!currentChunk || currentChunk.type != type) {
            currentChunk = {type: type, tasks: []}
            chunks.push(currentChunk)
        }

        if (push) {
            currentChunk.tasks.push(task)
        }
    }

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

            addTask('series', fn, function (cb) {
                fn.apply(null, makeArgs(fn, makeCallbackWrapper(name, true, cb), true))
            })
            return this
        },
        then: function (name, fn) {
            if (!fn) {
                fn = name
                name = '_prev'
            }

            addTask('series', fn, function (cb) {
                fn.apply(null, makeArgs(fn, makeCallbackWrapper(name, true, cb), false))
            })
            return this
        },
        parallel: function (name, fn) {
            if (!fn) {
                fn = name
                name = null
            }

            addTask('parallel', fn, function (cb) {
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

    obj.thenp(name, fn)

    process.nextTick(function () {
        async.eachSeries(chunks, function (chunk, cb) {
            if (chunk.tasks.length) {
                if (chunk.type === 'series') {
                    async.series(chunk.tasks, function (err) {
                        if (err === 'done') err = null
                        cb(err)
                    })
                } else if (chunk.type === 'parallel') {
                    async.parallel(chunk.tasks, cb)
                }
            } else {
                cb()
            }
        }, done)
    })

    return obj
}

asynch.parallel = function (name, fn) {
    return asynch().parallel(name, fn)
}
