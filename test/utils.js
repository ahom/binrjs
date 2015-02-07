/*global describe, it */
'use strict';

var assert = require('assert');

var async_test = function (promise, done, ok) {
  promise.then(function (value) {
    try {
      ok(value);
      done();
    } catch(err) {
      done(err);
    }
  }).catch(done);
};

module.exports = {
  async_test: async_test
}
