/*global describe, it */
'use strict';

var assert = require('assert');
var Context = require('../lib/context');
var sources = require('../lib/sources');
var types = require('../lib/types');
var utils = require('./utils');
var async_test = utils.async_test;

describe('binread', function () {
  describe('.context', function () {
    it('read', function (done) {
      async_test(new Context(sources([0x01])).read(types.int8), done, function (value) {
        assert.equal(value, 0x01);
      });
    });

    it('read_with_args', function (done) {
      async_test(new Context(sources([0x01, 0x02])).read_with_args(types.bytes)(2), done, function (value) {
        assert.equal(value[0], 0x01);
        assert.equal(value[1], 0x02);
      });
    });

    it('lazy_read', function (done) {
      var ctx = new Context(sources([0x01]));
      var lazy_value = ctx.lazy_read(types.int8);
      ctx.skip(1);

      async_test(lazy_value.read(), done, function (value) {
        assert.equal(value, 0x01);
      });
    });

    it('lazy_read_with_args', function (done) {
      var ctx = new Context(sources([0x01, 0x02]));
      var lazy_values = ctx.lazy_read_with_args(types.bytes)(2);
      ctx.skip(1);

      async_test(lazy_values.read(), done, function (value) {
        assert.equal(value[0], 0x01);
        assert.equal(value[1], 0x02);
      });
    });

    it('read_array', function (done) {
      async_test(new Context(sources([0x01, 0x02])).read_array(types.int8, 2), done, function (value) {
        assert.equal(value[0], 0x01);
        assert.equal(value[1], 0x02);
      });
    });

    it('read_array_with_args', function (done) {
      async_test(new Context(sources([0x01, 0x02, 0x03, 0x04])).read_array_with_args(types.bytes, 2)(function (i, f) {
          if (i === 0) {
            return f(1);
          } else {
            return f(3);
          }
        }), done, function (value) {
          assert.equal(value[0][0], 0x01);

          assert.equal(value[1][0], 0x02);
          assert.equal(value[1][1], 0x03);
          assert.equal(value[1][2], 0x04);
      });
    });

    it('lazy_read_array', function (done) {
      var ctx = new Context(sources([0x01, 0x02]));
      var lazy_values = ctx.lazy_read_array(types.int8, 2);
      ctx.skip(1);

      async_test(lazy_values.read(1), done, function (value) {
        assert.equal(value.length, 1);
        assert.equal(lazy_values.get(), value);

        async_test(lazy_values.read(), done, function (value) {
          assert.equal(value.length, 2);

          assert.equal(value[0], 0x01);
          assert.equal(value[1], 0x02);
          assert.equal(lazy_values.get(), value);
        });
      }, true);
    });

    it('lazy_read_array_with_args', function (done) {
      var ctx = new Context(sources([0x01, 0x02, 0x03, 0x04]));
      var lazy_values = ctx.lazy_read_array_with_args(types.bytes, 2)(function (i, f) {
        if (i === 0) {
          return f(1);
        } else {
          return f(3);
        }
      });
      ctx.skip(1);

      async_test(lazy_values.read(), done, function (value) {
        assert.equal(value.length, 2);

        assert.equal(value[0][0], 0x01);

        assert.equal(value[1][0], 0x02);
        assert.equal(value[1][1], 0x03);
        assert.equal(value[1][2], 0x04);
      });
    });

    it('seek', function () {
      var ctx = new Context(sources([0x00, 0x00, 0x00, 0x00]));

      assert.doesNotThrow(function () { ctx.seek(0); });
      assert.doesNotThrow(function () { ctx.seek(4); });

      assert.doesNotThrow(function () { ctx.seek(-1); });
      assert.doesNotThrow(function () { ctx.seek(-4); });
      assert.throws(function () { ctx.seek(5); }, RangeError);
      assert.throws(function () { ctx.seek(-5); }, RangeError);
    });

    it('skip', function () {
      var ctx = new Context(sources([0x00, 0x00, 0x00, 0x00]));

      ctx.seek(0);
      assert.doesNotThrow(function () { ctx.skip(0); });
      ctx.seek(0);
      assert.doesNotThrow(function () { ctx.skip(4); });

      ctx.seek(0);
      assert.throws(function () { ctx.skip(-1); }, RangeError);
      ctx.seek(0);
      assert.throws(function () { ctx.skip(5); }, RangeError);

      ctx.seek(4);
      assert.doesNotThrow(function () { ctx.skip(-1); });
      ctx.seek(4);
      assert.doesNotThrow(function () { ctx.skip(-4); });

      ctx.seek(4);
      assert.throws(function () { ctx.skip(1); }, RangeError);
      ctx.seek(4);
      assert.throws(function () { ctx.skip(-5); }, RangeError);
    });

    it('should correctly report errors for out of bounds seek', function (done) {
      var ctx = new Context(sources([]));
      ctx.read(types.int8, []).then(function (value) {
        assert.ok(false);
        done('Nothing thrown');
      }).catch(function (err) {
        assert.ok(err.err instanceof RangeError);
        assert.equal(err.stack_traces.length, 1);
        assert.equal(err.offset, 0);
        done();
      });
    });

    it('should correctly report errors for reads', function (done) {
      var ctx = new Context(sources([]));
      ctx.read(types.int8, []).then(function (value) {
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
});
