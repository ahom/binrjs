/*global describe, it */
'use strict';

var assert = require('assert');
var binread = require('../');

var get_context = function (bytes) {
  return binread.context(new DataView(new Uint8Array(bytes).buffer));
};

describe('binread', function () {
  describe('.context', function () {
    it('must handle correctly read', function () {
      var ctx = get_context([0x01]);

      assert.equal(ctx.read(binread.types.int8), 0x01);
    });

    it('must handle correctly read_with_args', function () {
      var ctx = get_context([0x01, 0x02]);

      var values = ctx.read_with_args(binread.types.bytes)(2);

      assert.equal(values[0], 0x01);
      assert.equal(values[1], 0x02);
    });

    it('must handle correctly read_array', function () {
      var ctx = get_context([0x01, 0x02]);

      var values = ctx.read_array(binread.types.int8, 2);

      assert.equal(values[0], 0x01);
      assert.equal(values[1], 0x02);
    });

    it('must handle correctly read_array_with_args', function () {
      var ctx = get_context([0x01, 0x02, 0x03, 0x04]);

      var values = ctx.read_array_with_args(binread.types.bytes, 2)(function (i, f) {
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
  });
});
