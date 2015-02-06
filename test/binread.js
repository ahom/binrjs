/*global describe, it */
'use strict';

var assert = require('assert');
var binread = require('../lib/binread');
var utils = require('./utils');
var async_test = utils.async_test;

var types = binread.types;

describe('binread', function () {
  it('must handle correctly read', function (done) {
    async_test(binread.read(types.int8, [0x01]), done, function (value) {
      assert.equal(value, 0x01);
    });
  });

  it('must handle correctly read_with_args', function (done) {
    async_test(binread.read_with_args(types.bytes, [0x01, 0x02])(2), done, function (values) {
      assert.equal(values[0], 0x01);
      assert.equal(values[1], 0x02);
    });
  });
});
