'use strict';

var StackTrace = require('./stack_trace');

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
      return data_source.getDataView(offset, length, post_process);
    },
    seek: function (offs) {
      offset = offs;
    },
    skip: function (count) {
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
          var onFulfilled = function (res) {
            var ret;
            try {
              ret = gen.next(res);
            } catch (e) {
              return reject(e);
            }
            next(ret);
          };
          var onRejected = function (err) {
            var ret;
            try {
              ret = gen.throw(err);
            } catch (e) {
              return reject(e);
            }
            next(ret);
          };
          var next = function (ret) {
            var value = ret.value;
            if (ret.done) {
              if (is_promise(value)) {
                ret.value.then(function (val) {
                  resolve(val);
                }, function (err) {
                  reject(err);
                });
              } else {
                resolve(ret.value);
              }
            } else {
              if (!is_promise(value)) {
                onFulfilled(value);
              } else {
                ret.value.then(onFulfilled, onRejected);
              }
            }
          };
          onFulfilled();
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
        return function () {
          return snapshoted_context.read_with_args(type).apply(snapshoted_context, args);
        };
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
          var i = 0;
          var chain_promises = function () {
            if (i < length) {
              apply_args(i, self.read_with_args(type)).then(function (value) {
                values.push(value);
                i += 1;
                chain_promises();
              }, function (err) {
                reject(err);
              });
            } else {
              fulfill(values);
            }
          };
          chain_promises();
        });
      };
    },
    read_array: function (type, length) {
      return this.read_array_with_args(type, length)(ident_func);
    },

    lazy_read_array_with_args: function (type, length) {
      var snapshoted_context = snapshot();
      return function (apply_args) {
        return function () {
          return snapshoted_context.read_array_with_args(type, length).call(null, apply_args);
        };
      };
    },
    lazy_read_array: function (type, length) {
      return this.lazy_read_array_with_args(type, length)(ident_func);
    }
  };
};

module.exports = Context;
