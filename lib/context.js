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

    /**
     * @param length: number of bytes to read
     * @param post_process: function that does some post_processing to the bytes before fulfilling the promise
     * @returns {Promise} A promise that returns an ArrayBuffer or a Buffer with the bytes requested
     */
    getDataView: function (length, post_process) {
      if (offset + length > this.size()) {
        throw new RangeError('Read outside of bounds: offset[' + offset + '] length[' + length + '] size[' + this.size() + ']');
      }
      var dview_value = data_source.getDataView(offset, length);
      if (is_promise(dview_value)) {
        return new Promise(function (fulfill, reject) {
          dview_value.then(function (value) {
            fulfill(post_process(value));
          }).catch(reject);
        });
      } else {
        return Promise.resolve(post_process(dview_value));
      }
    },

    /**
     * @param offs: offset in bytes to jump to, from the start of the buffer
     */
    seek: function (offs) {
      if (offs < 0) {
        offs = this.size() + offs;
      }
      if (offs > this.size() || offs < 0) {
        throw new RangeError('Seek outside of bounds: offset[' + offs + ']');
      }
      offset = offs;
    },

    /**
     * @param count: offset in bytes to jump to, from where we are in the buffer
     */
    skip: function (count) {
      if (offset + count > this.size() || offset + count < 0) {
        throw new RangeError('Skip outside of bounds: offset[' + offset + '] count[' + count + '] size[' + this.size() + ']');
      }
      offset += count;
    },

    /**
     * @returns position in the buffer
     */
    pos: function () {
      return offset;
    },

    /**
     * @returns total size of the buffer
     */
    size: function() {
      return data_source.size();
    },

    /**
     * @see binr.read_with_args
     * @returns {Promise} A promise that returns the result
     */
    read_with_args: function (type) {
      var self = this;
      return function () {
        // Init new stack trace with current stack trace as parent
        current_stack_trace = new StackTrace(current_stack_trace, type, arguments, offset);
        // If no parent, push it to the root stack_traces
        if (current_stack_trace.parent === null) {
          stack_traces.push(current_stack_trace);
        } else {
          current_stack_trace.parent.children.push(current_stack_trace);
        }
        // Create the struct generator and apply the arguments
        var gen = type.apply(self, arguments);
        return new Promise(function (fulfill, reject) {
          // At the end of the process we update the current stack trace to fill in missing infos
          var resolve = function (val) {
            current_stack_trace.value = val;
            current_stack_trace.size = offset - current_stack_trace.offset;
            current_stack_trace = current_stack_trace.parent;
            fulfill(val);
          };
          // Add some context in case we encountered an error
          var onRejected = function (err) {
            reject({
              err: err,
              stack_traces: self.getStackTraces(),
              offset: self.pos()
            });
          };
          // Process next value in the generator and give back resolved previous value
          var onFulfilled = function (res) {
            var ret = gen.next(res);
            next(ret);
          };
          // Process returned value
          var next = function (ret) {
            var value = ret.value;
            // If the generator is finishing we are handling the return value of the struct
            if (ret.done) {
              if (is_promise(value)) {
                ret.value.then(function (val) {
                  resolve(val);
                }).catch(onRejected);
              } else {
                resolve(ret.value);
              }
            } else {
              // We are midway in, just chain it away with the next value
              if (!is_promise(value)) {
                onFulfilled(value);
              } else {
                ret.value.then(onFulfilled).catch(onRejected);
              }
            }
          };
          // This try catch is here to be able to call onRejected in case the first call to onFulfilled fails
          try {
            onFulfilled();
          } catch (err) {
            onRejected(err);
          }
        });
      };
    },

    /**
     * @see binr.read
     * @returns {Promise} A promise that returns the result
     */
    read: function (type) {
      return this.read_with_args(type)();
    },

    /**
     * @see binr.lazy.LazyValue
     * @example
     * var lazy_value = this.lazy_read_with_args(binr.types.bytes, [0x01, 0x02, 0x03, 0x04])(2);
     * ...
     * lazy_value.read().then(function (value) {
     *   assert.deepEqual(value, new Uint8Array([0x01, 0x02]));
     * })
     * @returns {LazyValue} A LazyValue that will do the read action when instructed to do so
     */
    lazy_read_with_args: function (type) {
      // Snapshot the context to be able to start from where we were when triggering the read of the LazyValue
      var snapshoted_context = snapshot();
      return function () {
        var args = arguments;
        return new lazy.LazyValue(function () {
          // Just redirecting to read_with_args
          return snapshoted_context.read_with_args(type).apply(snapshoted_context, args);
        });
      };
    },

    /**
     * @see binr.lazy.LazyValue
     * @see lazy_read_with_args
     * @returns {LazyValue} A LazyValue that will do the read action when instructed to do so
     */
    lazy_read: function (type) {
      return this.lazy_read_with_args(type)();
    },

    /**
     * @param length: size of the array
     * @returns {Promise} A promise that returns the results as an array
     * TODO: Handle case where length < 0 or = 0
     */
    read_array_with_args: function (type, length) {
      // Saving this for use in promise
      var self = this;
      return function (apply_args) {
        return new Promise(function (fulfill, reject) {
          var values = [];
          // Chaining the promises one by one and pushing results in values
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
          // Start the chain at index 0
          chain_promises(0);
        });
      };
    },

    /**
     * @returns {Promise} A promise that returns the results as an array
     */
    read_array: function (type, length) {
      return this.read_array_with_args(type, length)(ident_func);
    },

    /**
     * @see lazy_read_with_args
     * @param length: size of the array
     * @returns {LazyValues} LazyValues that will do the read action when instructed to do so
     */
    lazy_read_array_with_args: function (type, length) {
      // Snapshot the context for later use
      var snapshoted_context = snapshot();
      return function (apply_args) {
        return new lazy.LazyValues(length, function (num) {
          // Defer to read_array_with_args
          return snapshoted_context.read_array_with_args(type, num).call(null, apply_args);
        });
      };
    },

    /**
     * @see lazy_read_array_with_args
     * @returns {LazyValues} LazyValues that will do the read action when instructed to do so
     */
    lazy_read_array: function (type, length) {
      return this.lazy_read_array_with_args(type, length)(ident_func);
    }
  };
};

module.exports = Context;
