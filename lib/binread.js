'use strict';

var context = require('./context');
var sources = require('./sources');

module.exports = {
  types: require('./types'),

  read_with_args: function (type, data) {
    return context(sources(data)).read_with_args(type);
  },
  read: function (type, data) {
    return context(sources(data)).read(type);
  }
}
