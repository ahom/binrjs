/*global describe, it */
'use strict';

var assert = require('assert');
var context = require('../lib/context');
var sources = require('../lib/sources');
var types = require('../lib/types');
var utils = require('./utils');
var async_test = utils.async_test;

describe('binread', function () {
  describe('.context', function () {
    it('must handle correctly read', function (done) {
      async_test(context(sources([0x01])).read(types.int8), done, function (value) {
        assert.equal(value, 0x01);
      });
    });

    it('must handle correctly read_with_args', function (done) {
      async_test(context(sources([0x01, 0x02])).read_with_args(types.bytes)(2), done, function (value) {
        assert.equal(value[0], 0x01);
        assert.equal(value[1], 0x02);
      });
    });

    it('must handle correctly lazy_read', function (done) {
      var ctx = context(sources([0x01]));
      var lazy_value = ctx.lazy_read(types.int8);
      ctx.skip(1);

      async_test(lazy_value(), done, function (value) {
        assert.equal(value, 0x01);
      });
    });

    it('must handle correctly lazy_read_with_args', function (done) {
      var ctx = context(sources([0x01, 0x02]));
      var lazy_values = ctx.lazy_read_with_args(types.bytes)(2);
      ctx.skip(1);

      async_test(lazy_values(), done, function (value) {
        assert.equal(value[0], 0x01);
        assert.equal(value[1], 0x02);
      });
    });

    it('must handle correctly read_array', function (done) {
      async_test(context(sources([0x01, 0x02])).read_array(types.int8, 2), done, function (value) {
        assert.equal(value[0], 0x01);
        assert.equal(value[1], 0x02);
      });
    });

    it('must handle correctly read_array_with_args', function (done) {
      async_test(context(sources([0x01, 0x02, 0x03, 0x04])).read_array_with_args(types.bytes, 2)(function (i, f) {
          if (i === 0) {
            return f(1);
          } else {
            return f(3);
          }
        }), done, function (value) {
          assert.equal(value[0][0], 0x01);

          assert.equal(value[1][0], 0x02);
          assert.equal(value[1][1], 0x03);
          assert.equal(value[1][2], 0x04);
      });
    });

    it('must handle correctly lazy_read_array', function (done) {
      var ctx = context(sources([0x01, 0x02]));
      var lazy_values = ctx.lazy_read_array(types.int8, 2);
      ctx.skip(1);

      async_test(lazy_values(), done, function (value) {
        assert.equal(value[0], 0x01);
        assert.equal(value[1], 0x02);
      });
    });

    it('must handle correctly lazy_read_array_with_args', function (done) {
      var ctx = context(sources([0x01, 0x02, 0x03, 0x04]));
      var lazy_values = ctx.lazy_read_array_with_args(types.bytes, 2)(function (i, f) {
        if (i === 0) {
          return f(1);
        } else {
          return f(3);
        }
      });
      ctx.skip(1);

      async_test(lazy_values(), done, function (value) {
        assert.equal(value[0][0], 0x01);

        assert.equal(value[1][0], 0x02);
        assert.equal(value[1][1], 0x03);
        assert.equal(value[1][2], 0x04);
      });
    });
  });
});
