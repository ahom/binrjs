/*global describe, it */
'use strict';

var assert = require('assert');
var sources = require('../lib/sources');

describe('binread', function () {
  describe('.sources', function () {
    it('must throw on unhandled types', function () {
      assert.throws(function () {
        sources();
      }, TypeError);
    });

    it('must handle correctly array of bytes', function () {
      assert.doesNotThrow(function () {
        sources([0x00, 0x01]);
      });
    });

    it('must handle correctly ArrayBuffers', function () {
      assert.doesNotThrow(function () {
        sources(new ArrayBuffer(2));
      });
    });
  });
});
