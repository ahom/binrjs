/*global describe, it */
'use strict';

var assert = require('assert');
var binread = require('../lib/binread');
var utils = require('./utils');
var async_test = utils.async_test;

var types = binread.types;

describe('binread', function () {
  it('.read', function (done) {
    async_test(binread.read(types.int8, [0x01]), done, function (value) {
      assert.equal(value, 0x01);
    });
  });

  it('.read_with_args', function (done) {
    async_test(binread.read_with_args(types.bytes, [0x01, 0x02])(2), done, function (values) {
      assert.equal(values[0], 0x01);
      assert.equal(values[1], 0x02);
    });
  });

  it('.trace_read', function (done) {
    async_test(binread.trace_read(types.int8, [0x01]), done, function (value) {
      assert.equal(value.value, 0x01);

      var stack_traces = value.stack_traces;
      assert.equal(stack_traces.length, 1);

      var stack_trace = stack_traces[0];
      assert.equal(stack_trace.offset, 0);
      assert.equal(stack_trace.size, 1);
      assert.equal(stack_trace.value, value.value);
      assert.equal(stack_trace.type.func, types.int8);
    });
  });

  it('.trace_read_with_args', function (done) {
    async_test(binread.trace_read_with_args(types.bytes, [0x01, 0x02])(2), done, function (value) {
      assert.equal(value.value[0], 0x01);
      assert.equal(value.value[1], 0x02);

      var stack_traces = value.stack_traces;
      assert.equal(stack_traces.length, 1);

      var stack_trace = stack_traces[0];
      assert.equal(stack_trace.offset, 0);
      assert.equal(stack_trace.size, 2);
      assert.equal(stack_trace.value, value.value);
      assert.equal(stack_trace.type.func, types.bytes);
      assert.equal(stack_trace.type.args[0], 2);
    });
  });
});
