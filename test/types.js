/*global describe, it */
'use strict';
var assert = require('assert');
var binread = require('../');

var test_integers = function (type, bytes, expected) {
  var ctx = binread.context(new DataView(new Uint8Array(bytes).buffer));
  for (var idx = 0; idx < expected.length; idx++) {
    assert.equal(type(ctx), expected[idx]);
  }
};

var test_floats = function (type, bytes, expected) {
  var ctx = binread.context(new DataView(new Uint8Array(bytes).buffer));
  for (var idx = 0; idx < expected.length; idx++) {
    assert.ok(Math.abs(type(ctx) - expected[idx]) < 0.1);
  }
};

describe('binread', function () {
  describe('.types', function () {
    it('must handle correctly int8 values', function () {
      test_integers(binread.types.int8,
        [0x00, 0x7F, 0xFF],
        [   0,  127,   -1]);
    });
    it('must handle correctly uint8 values', function () {
      test_integers(binread.types.uint8,
        [0x00, 0x7F, 0xFF],
        [   0,  127,  255]);
    });

    it('must handle correctly int16 values', function () {
      test_integers(binread.types.leint16,
        [0x00, 0x00, 0xFF, 0x7F, 0xFF, 0xFF],
        [         0,      32767,         -1]);
      test_integers(binread.types.beint16,
        [0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF],
        [         0,      32767,         -1]);
    });
    it('must handle correctly uint16 values', function () {
      test_integers(binread.types.leuint16,
        [0x00, 0x00, 0xFF, 0x7F, 0xFF, 0xFF],
        [         0,      32767,      65535]);
      test_integers(binread.types.beuint16,
        [0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF],
        [         0,      32767,      65535]);
    });

    it('must handle correctly int32 values', function () {
      test_integers(binread.types.leint32,
        [0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF],
        [                     0,             2147483647,                     -1]);
      test_integers(binread.types.beint32,
        [0x00, 0x00, 0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
        [                     0,             2147483647,                     -1]);
    });
    it('must handle correctly uint32 values', function () {
      test_integers(binread.types.leuint32,
        [0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF],
        [                     0,             2147483647,             4294967295]);
      test_integers(binread.types.beuint32,
        [0x00, 0x00, 0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
        [                     0,             2147483647,             4294967295]);
    });

/*
    it('must handle correctly int64 values', function () {
      test_integers(binread.types.leint64,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
        [                                             0,                            9223372036854775807,                                             -1]);
      test_integers(binread.types.beint64,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
        [                                             0,                            9223372036854775807,                                             -1]);
    });
    it('must handle correctly uint64 values', function () {
      test_integers(binread.types.leuint64,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
        [                                             0,                            9223372036854775807,                           18446744073709551616]);
      test_integers(binread.types.beuint64,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
        [                                             0,                            9223372036854775807,                           18446744073709551616]);
    });
*/

    it('must handle correctly float32 values', function () {
      test_floats(binread.types.lefloat32,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0xBF],
        [                   0.0,                   -1.0]);
      test_floats(binread.types.befloat32,
        [0x00, 0x00, 0x00, 0x00, 0xBF, 0x80, 0x00, 0x00],
        [                   0.0,                   -1.0]);
    });
    it('must handle correctly float64 values', function () {
      test_floats(binread.types.lefloat64,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0xBF],
        [                                           0.0,                                           -1.0]);
      test_floats(binread.types.befloat64,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xBF, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
        [                                           0.0,                                           -1.0]);
    });

    it('must handle correctly bytes values', function () {
      var values = [0x00, 0x01, 0xF0, 0xFF];
      var ctx = binread.context(new DataView(new Uint8Array(values).buffer));

      var bytes = binread.types.bytes;

      var one_byte = bytes(ctx, 1);
      assert.equal(one_byte[0], 0x00);

      var three_bytes = bytes(ctx, 3);
      assert.equal(three_bytes[0], 0x01);
      assert.equal(three_bytes[1], 0xF0);
      assert.equal(three_bytes[2], 0xFF);
    });

    it('must handle correctly struct values', function () {
      var values = [
        0x01, 0x02, 0x03, 0x04, // magic
        0x10, 0x00,             // major
        0x00, 0x01              // minor
      ];
      var ctx = binread.context(new DataView(new Uint8Array(values).buffer));

      var t = binread.types;

      var struct = function (ctx) {
        return {
          magic: t.bytes(ctx, 4),
          major: t.uint16(ctx),
          minor: t.beint16(ctx)
        };
      };

      var value = struct(ctx);

      assert.equal(value.magic[0], 0x01);
      assert.equal(value.magic[1], 0x02);
      assert.equal(value.magic[2], 0x03);
      assert.equal(value.magic[3], 0x04);

      assert.equal(value.major, 16);

      assert.equal(value.minor, 1);
    });
  });
});
