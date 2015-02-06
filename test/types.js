/*global describe, it */
'use strict';

var assert = require('assert');
var types = require('../lib/types');
var context = require('../lib/context');
var sources = require('../lib/sources');
var utils = require('./utils');
var async_test = utils.async_test;

var test_integers = function (type, done, bytes, expected) {
  async_test(context(sources(bytes)).read_array(type, expected.length), done, function (value) {
    for (var idx = 0; idx < expected.length; idx++) {
      assert.equal(value[idx], expected[idx]);
    }
  });
};

var test_floats = function (type, done, bytes, expected) {
  async_test(context(sources(bytes)).read_array(type, expected.length), done, function (value) {
    for (var idx = 0; idx < expected.length; idx++) {
      assert.ok(Math.abs(value[idx] - expected[idx]) < 0.1);
    }
  });
};

describe('binread', function () {
  describe('.types', function () {
    it('must handle correctly int8 values', function (done) {
      test_integers(types.int8, done,
        [0x00, 0x7F, 0xFF],
        [   0,  127,   -1]);
    });
    it('must handle correctly uint8 values', function (done) {
      test_integers(types.uint8, done,
        [0x00, 0x7F, 0xFF],
        [   0,  127,  255]);
    });

    it('must handle correctly leint16 values', function (done) {
      test_integers(types.leint16, done,
        [0x00, 0x00, 0xFF, 0x7F, 0xFF, 0xFF],
        [         0,      32767,         -1]);
    });
    it('must handle correctly beint16 values', function (done) {
      test_integers(types.beint16, done,
        [0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF],
        [         0,      32767,         -1]);
    });
    it('must handle correctly leuint16 values', function (done) {
      test_integers(types.leuint16, done,
        [0x00, 0x00, 0xFF, 0x7F, 0xFF, 0xFF],
        [         0,      32767,      65535]);
    });
    it('must handle correctly beuint16 values', function (done) {
      test_integers(types.beuint16, done,
        [0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF],
        [         0,      32767,      65535]);
    });

    it('must handle correctly leint32 values', function (done) {
      test_integers(types.leint32, done,
        [0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF],
        [                     0,             2147483647,                     -1]);
    });
    it('must handle correctly beint32 values', function (done) {
      test_integers(types.beint32, done,
        [0x00, 0x00, 0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
        [                     0,             2147483647,                     -1]);
    });
    it('must handle correctly leuint32 values', function (done) {
      test_integers(types.leuint32, done,
        [0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF],
        [                     0,             2147483647,             4294967295]);
    });
    it('must handle correctly beuint32 values', function (done) {
      test_integers(types.beuint32, done,
        [0x00, 0x00, 0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
        [                     0,             2147483647,             4294967295]);
    });

    it('must handle correctly lefloat32 values', function (done) {
      test_floats(types.lefloat32, done,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0xBF],
        [                   0.0,                   -1.0]);
    });
    it('must handle correctly befloat32 values', function (done) {
      test_floats(types.befloat32, done,
        [0x00, 0x00, 0x00, 0x00, 0xBF, 0x80, 0x00, 0x00],
        [                   0.0,                   -1.0]);
    });
    it('must handle correctly lefloat64 values', function (done) {
      test_floats(types.lefloat64, done,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0xBF],
        [                                           0.0,                                           -1.0]);
    });
    it('must handle correctly befloat64 values', function (done) {
      test_floats(types.befloat64, done,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xBF, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
        [                                           0.0,                                           -1.0]);
    });

    it('must handle correctly bytes values', function (done) {
      async_test(context(sources([0x01, 0xF0, 0xFF])).read_with_args(types.bytes)(3), done, function (value) {
        assert.equal(value[0], 0x01);
        assert.equal(value[1], 0xF0);
        assert.equal(value[2], 0xFF);
      });
    });

    it('must handle correctly struct values', function (done) {
      var ctx = context(sources([
        0x01, 0x02, 0x03, 0x04, // magic
        0x10, 0x00,             // major
        0x00, 0x01              // minor
      ]));

      var t = types;

      var struct = function* () {
        return {
          magic: yield this.read_with_args(t.bytes)(4),
          major: yield this.read(t.uint16),
          minor: yield this.read(t.beint16)
        };
      };

      async_test(ctx.read(struct), done, function (value) {
        assert.equal(value.magic[0], 0x01);
        assert.equal(value.magic[1], 0x02);
        assert.equal(value.magic[2], 0x03);
        assert.equal(value.magic[3], 0x04);

        assert.equal(value.major, 16);

        assert.equal(value.minor, 1);
      });
    });
  });
});
