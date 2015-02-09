'use strict';

var Context = require('./context');
var sources = require('./sources');

/**
 * @module binr
 */
module.exports = {
  types: require('./types'),

  /**
   * Reads a type from data with arguments
   * @example
   * binr.read_with_args(binr.types.bytes, [0x01, 0x02, 0x03, 0x04])(2).then(function (value) {
   *   assert.deepEqual(value, new Uint8Array([0x01, 0x02]));
   * })
   * @returns {Promise} A promise that returns the result
   */
  read_with_args: function (type, data) {
    return new Context(sources(data)).read_with_args(type);
  },

  /**
   * Reads a type from data without arguments
   * @example
   * binr.read(binr.types.uint8, [0x01, 0x02, 0x03, 0x04]).then(function (value) {
   *   assert.equal(value, 0x01);
   * })
   * @returns {Promise} A promise that returns the result
   */
  read: function (type, data) {
    return this.read_with_args(type, data)();
  },

  /**
   * Returns the stack trace for a read_with_args
   * @see read_with_args
   * @see StackTrace
   * @returns {Promise} A promise that returns the result
   */
  trace_read_with_args: function (type, data) {
    var context = new Context(sources(data));
    return function () {
      var args = arguments;
      return new Promise(function (fulfill, reject) {
        context.read_with_args(type).apply(null, args).then(function (value) {
          fulfill(context.getStackTraces()[0]);
        }, function (err) {
          reject(err);
        });
      });
    };
  },

  /**
   * Returns the stack trace for a read
   * @see read
   * @see StackTrace
   * @returns {Promise} A promise that returns the result
   */
  trace_read: function (type, data) {
    return this.trace_read_with_args(type, data)();
  }
};
