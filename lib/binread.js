'use strict';

var context = require('./context');

module.exports = {
  types: require('./types'),

  read_with_args: function (type, data) {
    return context.create_context(data).read_with_args(type);
  },
  read: function (type, data) {
    return context.create_context(data).read(type);
  }
}
