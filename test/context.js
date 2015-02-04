/*global describe, it */
'use strict';

var assert = require('assert');
var context = require('../lib/context');
var types = require('../lib/types');

describe('binread', function () {
  describe('.context', function () {
    it('must handle correctly read', function () {
      var ctx = context.create_context([0x01]);

      assert.equal(ctx.read(types.int8), 0x01);
    });

    it('must handle correctly read_with_args', function () {
      var ctx = context.create_context([0x01, 0x02]);

      var values = ctx.read_with_args(types.bytes)(2);

      assert.equal(values[0], 0x01);
      assert.equal(values[1], 0x02);
    });

    it('must handle correctly read_array', function () {
      var ctx = context.create_context([0x01, 0x02]);

      var values = ctx.read_array(types.int8, 2);

      assert.equal(values[0], 0x01);
      assert.equal(values[1], 0x02);
    });

    it('must handle correctly read_array_with_args', function () {
      var ctx = context.create_context([0x01, 0x02, 0x03, 0x04]);

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

    it('must handle correctly throw for unhandled types', function () {
      assert.throws(function () {
        context.create_context(0x01);
      }, TypeError);
    });
  });
});
