'use strict';

var Context = require('./context');
var sources = require('./sources');

module.exports = {
  types: require('./types'),

  read_with_args: function (type, data) {
    return new Context(sources(data)).read_with_args(type);
  },
  read: function (type, data) {
    return this.read_with_args(type, data)();
  },

  trace_read_with_args: function (type, data) {
    var context = new Context(sources(data));
    return function () {
      var args = arguments;
      return new Promise(function (fulfill, reject) {
        context.read_with_args(type).apply(null, args).then(function (value) {
          fulfill({
            stack_traces: context.getStackTraces(),
            value: value
          });
        }, function (err) {
          reject(err);
        });
      });
    };
  },
  trace_read: function (type, data) {
    return this.trace_read_with_args(type, data)();
  }
}
