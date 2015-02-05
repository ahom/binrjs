'use strict';

var array_buffer_source = function (array_buffer) {
  return {
    size: function() {
      return array_buffer.byteLength;
    },
    getDataView: function (offset, length) {
      return new DataView(array_buffer, offset, length);
    }
  };
}

var is_node =  (typeof(process) !== 'undefined' && process.title === 'node');

module.exports = function (data) {
  // Need to handle File (browser) / ArrayBuffer / Array of Bytes / filename (nodejs)

  var data_source = null;
  if (data instanceof Array) {
    data_source = array_buffer_source(new Uint8Array(data).buffer);
  } else if (data instanceof ArrayBuffer) {
    data_source = data;
  } else if (!is_node && typeof File !== 'undefined' && data instanceof File) {
    // TODO: Handle File case for browsers
  } else if (is_node && typeof data === 'string') {
    // TODO: Handle file case for nodejs
  }

  if (data_source === null) {
    throw TypeError('Cannot initialize data source with unsupported data type. Supported types are list of bytes [1, 2, 3, 255] and ArrayBuffers.');
  }

  return data_source;
};
