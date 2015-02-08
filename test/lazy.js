/*global describe, it */
'use strict';

var assert = require('assert');
var lazy = require('../lib/lazy');
var utils = require('./utils');
var async_test = utils.async_test;

describe('binread', function () {
  describe('.lazy', function () {
    it('LazyValue', function (done) {
      var lazy_value = lazy.LazyValue(function () {
        return Promise.resolve(4);
      });

      assert.equal(lazy_value.get(), null);

      async_test(lazy_value.read(), done, function (value) {
        assert.equal(value, 4);
        assert.equal(lazy_value.get(), value);

        async_test(lazy_value.read(), done, function (value) {
          assert.equal(value, 4);
          assert.equal(lazy_value.get(), value);
        });
      }, true);
    });

    it('LazyValues', function (done) {
      var already_read = 0;
      var lazy_values = lazy.LazyValues(5, function (num) {
        var promise = Promise.resolve([1, 2, 3, 4, 5].slice(already_read, already_read + num));
        already_read += num;
        return promise;
      });

      assert.deepEqual(lazy_values.get(), []);
      assert.equal(lazy_values.size(), 5);

      async_test(lazy_values.read(2), done, function (values) {
        assert.deepEqual(values, [1, 2]);
        assert.deepEqual(lazy_values.get(), values);

        async_test(lazy_values.read(3), done, function (values) {
          assert.deepEqual(values, [1, 2, 3, 4, 5]);
          assert.deepEqual(lazy_values.get(), values);

          async_test(lazy_values.read(), done, function (values) {
            assert.deepEqual(values, [1, 2, 3, 4, 5]);
            assert.deepEqual(lazy_values.get(), values);
          });
        }, true);
      }, true);
    });
  });
});
