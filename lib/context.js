'use strict';

var context = function (data_source, offset) {
  offset = offset || 0;

  var ident_func = function (i, f) {
    return f();
  };

  var snapshot = function () {
    return context(data_source, offset);
  };

  return {
    getDataView: function (length) {
      return data_source.getDataView(offset, length);
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
        var value = type.apply(self, arguments);
        return value;
      };
    },
    read: function (type) {
      return this.read_with_args(type)();
    },

    read_lazy_with_args: function (type) {
      var snapshoted_context = snapshot();
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
      return this.read_array_with_args(type, length)(ident_func);
    },

    read_array_lazy_with_args: function (type, length) {
      var snapshoted_context = snapshot();
      return function (apply_args) {
        return function () {
          return snapshoted_context.read_array_with_args(type, length).call(null, apply_args);
        };
      }
    },
    read_array_lazy: function (type, length) {
      return this.read_array_lazy_with_args(type, length)(ident_func);
    }
  }
};

module.exports = context;
