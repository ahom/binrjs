'use strict';

var context = function (data_view) {
  var dview = data_view;
  var offset = 0;

  var getCurrentDataView = function () {
    return new DataView(dview.buffer, dview.byteOffset + offset, dview.byteLength - offset);
  }

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
      var current_data_view = getCurrentDataView();
      var new_context = context(current_data_view);
      var self = this;
      return function () {
        var value = type.apply(new_context, arguments);
        self.skip(new_context.pos());
        return value;
      };
    },
    read: function (type) {
      return this.read_with_args(type)();
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
    }
  }
}

module.exports = context;
