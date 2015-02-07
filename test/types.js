/*global describe, it */
'use strict';

var assert = require('assert');
var types = require('../lib/types');
var Context = require('../lib/context');
var sources = require('../lib/sources');
var utils = require('./utils');
var async_test = utils.async_test;

var test_integers = function (type, done, bytes, expected) {
  async_test(new Context(sources(bytes)).read_array(type, expected.length), done, function (value) {
    for (var idx = 0; idx < expected.length; idx++) {
      assert.equal(value[idx], expected[idx]);
    }
  });
};

var test_floats = function (type, done, bytes, expected) {
  async_test(new Context(sources(bytes)).read_array(type, expected.length), done, function (value) {
    for (var idx = 0; idx < expected.length; idx++) {
      assert.ok(Math.abs(value[idx] - expected[idx]) < 0.1);
    }
  });
};

describe('binread', function () {
  describe('.types', function () {
    it('.int8', function (done) {
      test_integers(types.int8, done,
        [0x00, 0x7F, 0xFF],
        [   0,  127,   -1]);
    });
    it('.uint8', function (done) {
      test_integers(types.uint8, done,
        [0x00, 0x7F, 0xFF],
        [   0,  127,  255]);
    });

    it('.leint16', function (done) {
      test_integers(types.leint16, done,
        [0x00, 0x00, 0xFF, 0x7F, 0xFF, 0xFF],
        [         0,      32767,         -1]);
    });
    it('.beint16', function (done) {
      test_integers(types.beint16, done,
        [0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF],
        [         0,      32767,         -1]);
    });
    it('.leuint16', function (done) {
      test_integers(types.leuint16, done,
        [0x00, 0x00, 0xFF, 0x7F, 0xFF, 0xFF],
        [         0,      32767,      65535]);
    });
    it('.beuint16', function (done) {
      test_integers(types.beuint16, done,
        [0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF],
        [         0,      32767,      65535]);
    });

    it('.leint32', function (done) {
      test_integers(types.leint32, done,
        [0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF],
        [                     0,             2147483647,                     -1]);
    });
    it('.beint32', function (done) {
      test_integers(types.beint32, done,
        [0x00, 0x00, 0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
        [                     0,             2147483647,                     -1]);
    });
    it('.leuint32', function (done) {
      test_integers(types.leuint32, done,
        [0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF],
        [                     0,             2147483647,             4294967295]);
    });
    it('.beuint32', function (done) {
      test_integers(types.beuint32, done,
        [0x00, 0x00, 0x00, 0x00, 0x7F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
        [                     0,             2147483647,             4294967295]);
    });

    it('.lefloat32', function (done) {
      test_floats(types.lefloat32, done,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0xBF],
        [                   0.0,                   -1.0]);
    });
    it('.befloat32', function (done) {
      test_floats(types.befloat32, done,
        [0x00, 0x00, 0x00, 0x00, 0xBF, 0x80, 0x00, 0x00],
        [                   0.0,                   -1.0]);
    });
    it('.lefloat64', function (done) {
      test_floats(types.lefloat64, done,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0xBF],
        [                                           0.0,                                           -1.0]);
    });
    it('.befloat64', function (done) {
      test_floats(types.befloat64, done,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xBF, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
        [                                           0.0,                                           -1.0]);
    });

    it('.bytes', function (done) {
      async_test(new Context(sources([0x01, 0xF0, 0xFF])).read_with_args(types.bytes)(3), done, function (value) {
        assert.equal(value[0], 0x01);
        assert.equal(value[1], 0xF0);
        assert.equal(value[2], 0xFF);
      });
    });

    it('must handle correctly structs', function (done) {
      var ctx = new Context(sources([
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
