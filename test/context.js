/*global describe, it */
'use strict';

var assert = require('assert');
var context = require('../lib/context');
var sources = require('../lib/sources');
var types = require('../lib/types');

describe('binread', function () {
  describe('.context', function () {
    it('must handle correctly read', function () {
      var ctx = context(sources([0x01]));

      assert.equal(ctx.read(types.int8), 0x01);
    });

    it('must handle correctly read_with_args', function () {
      var ctx = context(sources([0x01, 0x02]));

      var values = ctx.read_with_args(types.bytes)(2);

      assert.equal(values[0], 0x01);
      assert.equal(values[1], 0x02);
    });

    it('must handle correctly read_lazy', function () {
      var ctx = context(sources([0x01]));

      var lazy_value = ctx.read_lazy(types.int8);

      ctx.skip(1);

      lazy_value = lazy_value();

      assert.equal(lazy_value, 0x01);
    });

    it('must handle correctly read_lazy_with_args', function () {
      var ctx = context(sources([0x01, 0x02]));

      var lazy_values = ctx.read_lazy_with_args(types.bytes)(2);

      ctx.skip(1);

      lazy_values = lazy_values();

      assert.equal(lazy_values[0], 0x01);
      assert.equal(lazy_values[1], 0x02);
    });

    it('must handle correctly read_array', function () {
      var ctx = context(sources([0x01, 0x02]));

      var values = ctx.read_array(types.int8, 2);

      assert.equal(values[0], 0x01);
      assert.equal(values[1], 0x02);
    });

    it('must handle correctly read_array_with_args', function () {
      var ctx = context(sources([0x01, 0x02, 0x03, 0x04]));

      var values = ctx.read_array_with_args(types.bytes, 2)(function (i, f) {
        if (i === 0) {
          return f(1);
        } else {
          return f(3);
        }
      });

      assert.equal(values[0][0], 0x01);

      assert.equal(values[1][0], 0x02);
      assert.equal(values[1][1], 0x03);
      assert.equal(values[1][2], 0x04);
    });

    it('must handle correctly read_array_lazy', function () {
      var ctx = context(sources([0x01, 0x02]));

      var lazy_values = ctx.read_array_lazy(types.int8, 2);

      ctx.skip(1);

      lazy_values = lazy_values();

      assert.equal(lazy_values[0], 0x01);
      assert.equal(lazy_values[1], 0x02);
    });

    it('must handle correctly read_array_lazy_with_args', function () {
      var ctx = context(sources([0x01, 0x02, 0x03, 0x04]));

      var lazy_values = ctx.read_array_lazy_with_args(types.bytes, 2)(function (i, f) {
        if (i === 0) {
          return f(1);
        } else {
          return f(3);
        }
      });

      ctx.skip(1);

      lazy_values = lazy_values();

      assert.equal(lazy_values[0][0], 0x01);

      assert.equal(lazy_values[1][0], 0x02);
      assert.equal(lazy_values[1][1], 0x03);
      assert.equal(lazy_values[1][2], 0x04);
    });
  });
});
