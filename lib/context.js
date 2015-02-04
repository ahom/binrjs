'use strict';

var context = function (data_view, offs) {
  var dview = data_view;
  var offset = offs || 0;

  var snapshot_context = function () {
    return context(dview, offset);
  };

  return {
    getDataView: function () {
      return dview;
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

    read_with_args: function (type) {
      var self = this;
      return function () {
        var value = type.apply(self, arguments);
        return value;
      };
    },
    read: function (type) {
      return this.read_with_args(type)();
    },

    read_lazy_with_args: function (type) {
      var self = this;
      var snapshoted_context = snapshot_context();
      return function () {
        var args = arguments;
        return function () {
          return snapshoted_context.read_with_args(type).apply(snapshoted_context, args);
        }
      };
    },
    read_lazy: function (type) {
      return this.read_lazy_with_args(type)();
    },

    read_array_with_args: function (type, length) {
      var self = this;
      return function (apply_args) {
        var values = [];
        for (var i = 0; i < length; i++) {
          values.push(apply_args(i, self.read_with_args(type)));
        }
        return values;
      }
    },
    read_array: function (type, length) {
      return this.read_array_with_args(type, length)(function (i, f) { return f(); });
    },

    read_array_lazy_with_args: function (type, length) {
      var self = this;
      var snapshoted_context = snapshot_context();
      return function (apply_args) {
        return function () {
          return snapshoted_context.read_array_with_args(type, length)(apply_args);
        };
      }
    },
    read_array_lazy: function (type, length) {
      return this.read_array_lazy_with_args(type, length)(function (i, f) { return f(); });
    }
  }
}

var create_context = function (data) {
  var array_buffer = null;
  if (data instanceof Array) {
    array_buffer = new Uint8Array(data).buffer;
  } else if (data instanceof ArrayBuffer) {
    array_buffer = data;
  }

  // Need to handle File (browser) / ArrayBuffer / Array of Bytes / filename (nodejs)

  if (array_buffer !== null) {
    return context(new DataView(array_buffer));
  } else {
    throw TypeError('Cannot initialize context with unsupported data type. Supported types are list of bytes [1, 2, 3, 255] and ArrayBuffers.');
  }
};

module.exports = {
  context: context,
  create_context: create_context
};
