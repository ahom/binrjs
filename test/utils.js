'use strict';

var async_test = function (promise, done, ok, not_set_done) {
  not_set_done = not_set_done || false;
  promise.then(function (value) {
    ok(value);
    if (!not_set_done) {
      done();
    }
  }).catch(done);
};

module.exports = {
  async_test: async_test
};
