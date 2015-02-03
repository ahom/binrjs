/*global describe, it */
'use strict';
var assert = require('assert');
var binread = require('../');

var test_integers = function (type, Typed_array, values) {
  var ctx = binread.context(new DataView(new Typed_array(values).buffer));
  for (var value_idx in values) {
    assert.equal(type(ctx), values[value_idx]);
  }
};

describe('binread', function () {
  describe('.types', function () {
    it('must handle correctly int8 values', function () {
      test_integers(binread.types.int8, Int8Array, [0, 5, -5, -127, 127]);
    });

    it('must handle correctly int16 values', function () {
      test_integers(binread.types.int16, Int16Array, [0, 10, -10, -32767, 32767]);
    });
  });
});
