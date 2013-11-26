'use strict';

var async = require('async')

async.w = function waterfallHelper(fn) {
    var obj = {
        tasks: [fn],
        then: function (fn) {
            this.tasks.push(fn)
            return this
        },
        done: function (fn) {
            this.donecb = fn
        }
    }

    setImmediate(function () {
        async.waterfall(obj.tasks, obj.donecb)
    })

    return obj
}
