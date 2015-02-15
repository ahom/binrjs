/*global describe, it */
'use strict';

var assert = require('assert');
var sources = require('../lib/sources');

var ident = function (val) {
  return val;
};

describe('binr', function () {
  describe('.sources', function () {
    it('must throw on unhandled types', function () {
      assert.throws(function () {
        sources();
      }, TypeError);
    });

    it('Array', function () {
      var source = null;
      assert.doesNotThrow(function () {
        source = sources([0x00, 0x01]);
      });

      assert.equal(source.size(), 2);

      var value = source.getDataView(0, 2, ident);
      assert.ok(value instanceof DataView);
      assert.equal(value.byteOffset, 0);
      assert.equal(value.byteLength, 2);
      assert.equal(value.getUint8(0), 0x00);
      assert.equal(value.getUint8(1), 0x01);
    });

    it('ArrayBuffers', function () {
      var source = null;
      assert.doesNotThrow(function () {
        source = sources(new Uint8Array([0x00, 0x01]).buffer);
      });

      assert.equal(source.size(), 2);

      var value = source.getDataView(0, 2, ident);
      assert.ok(value instanceof DataView);
      assert.equal(value.byteOffset, 0);
      assert.equal(value.byteLength, 2);
      assert.equal(value.getUint8(0), 0x00);
      assert.equal(value.getUint8(1), 0x01);
    });
  });
});
