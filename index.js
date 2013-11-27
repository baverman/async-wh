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

module.exports = function waterfallHelper(fn) {
    var obj = {
        tasks: [fn],
        then: function (fn) {
            this.tasks.push(fn)
            return this
        },
        done: function (fn) {
            this.donecb = function (err) {
                if (err === 'done') {
                    arguments[0] = null
                }
                fn.apply(null, arguments)
            }
        }
    }

    process.nextTick(function () {
        async.waterfall(obj.tasks, obj.donecb)
    })

    return obj
}
