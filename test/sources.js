/*global describe, it */
'use strict';

var assert = require('assert');
var sources = require('../lib/sources');
var utils = require('./utils');
var async_test = utils.async_test;

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

    it('must handle correctly array of bytes', function (done) {
      var source = null;
      assert.doesNotThrow(function () {
        source = sources([0x00, 0x01]);
      });

      assert.equal(source.size(), 2);

      async_test(source.getDataView(0, 2, ident), done, function (value) {
        assert.ok(value instanceof DataView);
        assert.equal(value.byteOffset, 0);
        assert.equal(value.byteLength, 2);
        assert.equal(value.getUint8(0), 0x00);
        assert.equal(value.getUint8(1), 0x01);
      });
    });

    it('must handle correctly ArrayBuffers', function (done) {
      var source = null;
      assert.doesNotThrow(function () {
        source = sources(new Uint8Array([0x00, 0x01]).buffer);
      });

      assert.equal(source.size(), 2);

      async_test(source.getDataView(0, 2, ident), done, function (value) {
        assert.ok(value instanceof DataView);
        assert.equal(value.byteOffset, 0);
        assert.equal(value.byteLength, 2);
        assert.equal(value.getUint8(0), 0x00);
        assert.equal(value.getUint8(1), 0x01);
      });
    });

    it('must handle correctly Buffers(node)', function (done) {
      var source = null;
      assert.doesNotThrow(function () {
        source = sources(new Buffer([0x00, 0x01]));
      });

      assert.equal(source.size(), 2);

      async_test(source.getDataView(0, 2, ident), done, function (value) {
        assert.equal(value.byteOffset, 0);
        assert.equal(value.byteLength, 2);
        assert.equal(value.getUint8(0), 0x00);
        assert.equal(value.getUint8(1), 0x01);
      });
    });
  });
});
