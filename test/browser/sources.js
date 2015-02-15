/*global describe, it, File */
'use strict';

var assert = require('assert');
var sources = require('../../lib/browser/sources');
var utils = require('../utils');
var async_test = utils.async_test;

var ident = function (val) {
  return val;
};

describe('binr', function () {
  describe('.browser_sources', function () {
    it('File (Async)', function (done) {
      var source = null;
      assert.doesNotThrow(function () {
        source = sources(new File([new Uint8Array([0x00, 0x01])], ""));
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
