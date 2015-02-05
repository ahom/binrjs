'use strict';

var array_buffer_source = function (array_buffer, offset) {
  offset = offset || 0;

  return {
    seek: function (offs) {
      offset = offs;
    },
    skip: function (count) {
      offset += count;
    },
    pos: function () {
      return offset;
    },

    getDataView: function (length) {
      return new DataView(array_buffer, offset, length);
    },

    snapshot: function () {
      return array_buffer_source(array_buffer, offset);
    }
  };
}

module.exports = function (data) {
  // Need to handle File (browser) / ArrayBuffer / Array of Bytes / filename (nodejs)

  var data_source = null;
  if (data instanceof Array) {
    data_source = array_buffer_source(new Uint8Array(data).buffer);
  } else if (data instanceof ArrayBuffer) {
    data_source = data;
  }

  if (data_source === null) {
    throw TypeError('Cannot initialize data source with unsupported data type. Supported types are list of bytes [1, 2, 3, 255] and ArrayBuffers.');
  }

  return data_source;
};
