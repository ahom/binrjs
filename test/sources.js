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
  });
});
