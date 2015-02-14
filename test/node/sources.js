/*global describe, it */
'use strict';

var assert = require('assert');
var fs = require('fs');
var sources = require('../../lib/node/sources');
var utils = require('../utils');
var async_test = utils.async_test;

var ident = function (val) {
  return val;
};

describe('binr', function () {
  describe('.node_sources', function () {
    it('Buffers', function (done) {
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

    it('NodeFile', function (done) {
      var filename = 'test_sources.tmp';
      var fd = fs.openSync(filename, 'w');
      fs.writeSync(fd, new Buffer([0x00, 0x01]), 0, 2);
      fs.closeSync(fd);

      var source = null;
      assert.doesNotThrow(function () {
        source = sources(filename);
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
