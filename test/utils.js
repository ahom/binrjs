/*global describe, it */
'use strict';

var assert = require('assert');

var async_test = function (promise, done, ok, not_set_done) {
  not_set_done = not_set_done || false;
  promise.then(function (value) {
    try {
      ok(value);
      if (!not_set_done) {
        done();
      }
    } catch(err) {
      done(err);
    }
  }).catch(done);
};

module.exports = {
  async_test: async_test
}
