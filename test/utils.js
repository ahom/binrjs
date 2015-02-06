/*global describe, it */
'use strict';

var assert = require('assert');

var async_test = function (promise, done, ok) {
  promise.then(function (value) {
    ok(value);
    done();
  }, function (err) {
    assert.ok(false, err);
    done();
  })
};

module.exports = {
  async_test: async_test
}
