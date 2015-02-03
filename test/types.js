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
  });
});
