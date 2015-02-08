/*global describe, it */
'use strict';

var assert = require('assert');
var binread = require('../lib/binread');
var utils = require('./utils');
var async_test = utils.async_test;

var types = binread.types;

var test_sub_struct = function* (maj, min) {
  maj = maj || 0;
  min = min || 0;
  return {
    major: (yield this.read(types.uint16)) + maj,
    minor: (yield this.read(types.beint16)) + min
  };
};

var test_struct = function* (maj, min) {
  maj = maj || 0;
  min = min || 0;
  return {
    magic: yield this.read_with_args(types.bytes)(4),
    version: yield this.lazy_read_with_args(test_sub_struct)(maj, min)
  };
};
var test_result = {
  magic: new Uint8Array([0x01, 0x02, 0x03, 0x04]),
  version: {
    major: 16,
    minor: 1
  }
};
var test_data = [
  0x01, 0x02, 0x03, 0x04, // magic
  0x10, 0x00,             // major
  0x00, 0x01              // minor
];

describe('binread', function () {
  it('read', function (done) {
    async_test(binread.read(test_struct, test_data), done, function (value) {
      assert.deepEqual(value.magic, test_result.magic);

      async_test(value.version.read(), done, function (version_value) {
        assert.deepEqual(version_value, test_result.version);
      });
    }, true);
  });

  it('read_with_args', function (done) {
    async_test(binread.read_with_args(test_struct, test_data)(1, 2), done, function (value) {
      assert.deepEqual(value.magic, test_result.magic);

      async_test(value.version.read(), done, function (version_value) {
        assert.equal(version_value.major, test_result.version.major + 1);
        assert.equal(version_value.minor, test_result.version.minor + 2);
      });
    }, true);
  });

  it('trace_read', function (done) {
    async_test(binread.trace_read(test_struct, test_data), done, function (stack_trace) {
      assert.equal(stack_trace.offset, 0);
      assert.equal(stack_trace.size, 4);
      assert.equal(stack_trace.type.func, test_struct);
      assert.equal(stack_trace.children.length, 1);

      var magic_stack_trace = stack_trace.children[0];
      assert.equal(magic_stack_trace.offset, 0);
      assert.equal(magic_stack_trace.size, 4);
      assert.deepEqual(magic_stack_trace.value, test_result.magic);
      assert.equal(magic_stack_trace.type.func, types.bytes);
      assert.equal(magic_stack_trace.type.args[0], 4);

      async_test(stack_trace.value.version.read(), done, function (version_value) {
        assert.deepEqual(version_value, test_result.version);

        assert.equal(stack_trace.offset, 0);
        assert.equal(stack_trace.size, 4);
        assert.equal(stack_trace.type.func, test_struct);
        assert.equal(stack_trace.children.length, 2);

        var magic_stack_trace_lazy = stack_trace.children[0];
        assert.equal(magic_stack_trace_lazy.offset, 0);
        assert.equal(magic_stack_trace_lazy.size, 4);
        assert.deepEqual(magic_stack_trace_lazy.value, test_result.magic);
        assert.equal(magic_stack_trace_lazy.type.func, types.bytes);
        assert.equal(magic_stack_trace_lazy.type.args[0], 4);

        var version_stack_trace = stack_trace.children[1];
        assert.equal(version_stack_trace.offset, 4);
        assert.equal(version_stack_trace.size, 4);
        assert.deepEqual(version_stack_trace.value, test_result.version);
        assert.equal(version_stack_trace.type.func, test_sub_struct);
        assert.equal(version_stack_trace.type.args[0], 0);
        assert.equal(version_stack_trace.type.args[1], 0);
        assert.equal(version_stack_trace.children.length, 2);

        var major_stack_trace = version_stack_trace.children[0];
        assert.equal(major_stack_trace.offset, 4);
        assert.equal(major_stack_trace.size, 2);
        assert.equal(major_stack_trace.value, test_result.version.major);
        assert.equal(major_stack_trace.type.func, types.uint16);

        var minor_stack_trace = version_stack_trace.children[1];
        assert.equal(minor_stack_trace.offset, 6);
        assert.equal(minor_stack_trace.size, 2);
        assert.equal(minor_stack_trace.value, test_result.version.minor);
        assert.equal(minor_stack_trace.type.func, types.beint16);
      });
    }, true);
  });

  it('trace_read_with_args', function (done) {
    async_test(binread.trace_read_with_args(test_struct, test_data)(1, 2), done, function (stack_trace) {
      assert.equal(stack_trace.offset, 0);
      assert.equal(stack_trace.size, 4);
      assert.equal(stack_trace.type.func, test_struct);
      assert.equal(stack_trace.children.length, 1);

      var magic_stack_trace = stack_trace.children[0];
      assert.equal(magic_stack_trace.offset, 0);
      assert.equal(magic_stack_trace.size, 4);
      assert.deepEqual(magic_stack_trace.value, test_result.magic);
      assert.equal(magic_stack_trace.type.func, types.bytes);
      assert.equal(magic_stack_trace.type.args[0], 4);

      async_test(stack_trace.value.version.read(), done, function (version_value) {
        assert.equal(version_value.major, test_result.version.major + 1);
        assert.equal(version_value.minor, test_result.version.minor + 2);

        assert.equal(stack_trace.offset, 0);
        assert.equal(stack_trace.size, 4);
        assert.equal(stack_trace.type.func, test_struct);
        assert.equal(stack_trace.children.length, 2);

        var magic_stack_trace_lazy = stack_trace.children[0];
        assert.equal(magic_stack_trace_lazy.offset, 0);
        assert.equal(magic_stack_trace_lazy.size, 4);
        assert.deepEqual(magic_stack_trace_lazy.value, test_result.magic);
        assert.equal(magic_stack_trace_lazy.type.func, types.bytes);
        assert.equal(magic_stack_trace_lazy.type.args[0], 4);

        var version_stack_trace = stack_trace.children[1];
        assert.equal(version_stack_trace.offset, 4);
        assert.equal(version_stack_trace.size, 4);
        assert.equal(version_stack_trace.type.func, test_sub_struct);
        assert.equal(version_stack_trace.type.args[0], 1);
        assert.equal(version_stack_trace.type.args[1], 2);
        assert.equal(version_stack_trace.children.length, 2);

        var major_stack_trace = version_stack_trace.children[0];
        assert.equal(major_stack_trace.offset, 4);
        assert.equal(major_stack_trace.size, 2);
        assert.equal(major_stack_trace.value, test_result.version.major);
        assert.equal(major_stack_trace.type.func, types.uint16);

        var minor_stack_trace = version_stack_trace.children[1];
        assert.equal(minor_stack_trace.offset, 6);
        assert.equal(minor_stack_trace.size, 2);
        assert.equal(minor_stack_trace.value, test_result.version.minor);
        assert.equal(minor_stack_trace.type.func, types.beint16);
      });
    }, true);
  });

  it('should correctly report errors for traces', function (done) {
    binread.trace_read(types.int8, []).then(function (value) {
      assert.ok(false);
      done('Nothing thrown');
    }).catch(function (err) {
      assert.ok(err.err instanceof RangeError);
      assert.equal(err.stack_traces.length, 1);
      assert.equal(err.offset, 0);
      done();
    });
  });
});
