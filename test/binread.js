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

  it('must handle correctly read_array', function () {
    var values = binread.read_array(types.int8, 2, [0x01, 0x02]);

    assert.equal(values[0], 0x01);
    assert.equal(values[1], 0x02);
  });

  it('must handle correctly read_array_with_args', function () {
    var values = binread.read_array_with_args(types.bytes, 2, [0x01, 0x02, 0x03, 0x04])(function (i, f) {
      if (i === 0) {
        return f(1);
      } else {
        return f(3);
      }
    });

    assert.equal(values[0][0], 0x01);

    assert.equal(values[1][0], 0x02);
    assert.equal(values[1][1], 0x03);
    assert.equal(values[1][2], 0x04);
  });
});
