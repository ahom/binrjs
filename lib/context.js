'use strict';

var StackTrace = require('./stack_trace');
var lazy = require('./lazy');

var is_promise = function (obj) {
  return 'function' == typeof obj.then;
};

var Context = function (data_source, offset, init_stack_trace) {
  var stack_traces = [];
  var current_stack_trace = init_stack_trace || null;

  offset = offset || 0;

  var ident_func = function (i, f) {
    return f();
  };

  var snapshot = function () {
    return new Context(data_source, offset, current_stack_trace);
  };

  return {
    getStackTraces: function () {
      return stack_traces;
    },
    getDataView: function (length, post_process) {
      if (offset + length > this.size()) {
        throw new RangeError('Read outside of bounds: offset[' + offset + '] length[' + length + '] size[' + this.size() + ']');
      }
      return data_source.getDataView(offset, length, post_process);
    },
    seek: function (offs) {
      if (offs < 0) {
        offs = this.size() + offs;
      }
      if (offs >= this.size()) {
        throw new RangeError('Seek outside of bounds: offset[' + offs + ']');
      }
      offset = offs;
    },
    skip: function (count) {
      if (offset + count > this.size() || offset + count < 0) {
        throw new RangeError('Skip outside of bounds: offset[' + offset + '] count[' + count + '] size[' + this.size() + ']');
      }
      offset += count;
    },
    pos: function () {
      return offset;
    },
    size: function() {
      return data_source.size();
    },

    read_with_args: function (type) {
      var self = this;
      return function () {
        current_stack_trace = new StackTrace(current_stack_trace, type, arguments, offset);
        if (current_stack_trace.parent === null) {
          stack_traces.push(current_stack_trace);
        } else {
          current_stack_trace.parent.children.push(current_stack_trace);
        }
        var gen = type.apply(self, arguments);
        return new Promise(function (fulfill, reject) {
          var resolve = function (val) {
            current_stack_trace.value = val;
            current_stack_trace.size = offset - current_stack_trace.offset;
            current_stack_trace = current_stack_trace.parent;
            fulfill(val);
          };
          var onRejected = function (err) {
            reject({
              err: err,
              stack_traces: self.getStackTraces(),
              offset: self.pos()
            });
          };
          var onFulfilled = function (res) {
            var ret = gen.next(res);
            next(ret);
          };
          var next = function (ret) {
            var value = ret.value;
            if (ret.done) {
              if (is_promise(value)) {
                ret.value.then(function (val) {
                  resolve(val);
                }).catch(onRejected);
              } else {
                resolve(ret.value);
              }
            } else {
              if (!is_promise(value)) {
                onFulfilled(value);
              } else {
                ret.value.then(onFulfilled).catch(onRejected);
              }
            }
          };
          try {
            onFulfilled();
          } catch (err) {
            onRejected(err);
          }
        });
      };
    },
    read: function (type) {
      return this.read_with_args(type)();
    },

    lazy_read_with_args: function (type) {
      var snapshoted_context = snapshot();
      return function () {
        var args = arguments;
        return new lazy.LazyValue(function () {
          return snapshoted_context.read_with_args(type).apply(snapshoted_context, args);
        });
      };
    },
    lazy_read: function (type) {
      return this.lazy_read_with_args(type)();
    },

    read_array_with_args: function (type, length) {
      var self = this;
      return function (apply_args) {
        return new Promise(function (fulfill, reject) {
          var values = [];
          var chain_promises = function (num) {
            if (num < length) {
              apply_args(num, self.read_with_args(type)).then(function (value) {
                values.push(value);
                chain_promises(num + 1);
              }).catch(reject);
            } else {
              fulfill(values);
            }
          };
          chain_promises(0);
        });
      };
    },
    read_array: function (type, length) {
      return this.read_array_with_args(type, length)(ident_func);
    },

    lazy_read_array_with_args: function (type, length) {
      var snapshoted_context = snapshot();
      return function (apply_args) {
        return new lazy.LazyValues(length, function (num) {
          return snapshoted_context.read_array_with_args(type, num).call(null, apply_args);
        });
      };
    },
    lazy_read_array: function (type, length) {
      return this.lazy_read_array_with_args(type, length)(ident_func);
    }
  };
};

module.exports = Context;
