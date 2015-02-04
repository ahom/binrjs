/*global describe, it */
'use strict';

var assert = require('assert');
var binread = require('../lib/binread');

var types = binread.types;

describe('binread', function () {
  it('must handle correctly read', function () {
    assert.equal(binread.read(types.int8, [0x01]), 0x01);
  });

  it('must handle correctly read_with_args', function () {
    var values = binread.read_with_args(types.bytes, [0x01, 0x02])(2);

    assert.equal(values[0], 0x01);
    assert.equal(values[1], 0x02);
  });
});
