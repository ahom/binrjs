'use strict';

/**
 * Source for an ArrayBuffer
 * @class ArrayBufferSource
 */
var ArrayBufferSource = function (array_buffer) {
  return {
    size: function () {
      return array_buffer.byteLength;
    },
    getDataView: function (offset, length, post_process) {
      return new Promise(function (fulfill, reject) {
        var value = new DataView(array_buffer, offset, length);
        fulfill(post_process(value));
      });
    }
  };
};

module.exports = function (data) {
  var data_source = null;

  if (data instanceof Array) {
    data_source = new ArrayBufferSource(new Uint8Array(data).buffer);
  } else if (data instanceof ArrayBuffer) {
    data_source = new ArrayBufferSource(data);
  } 

  if (data_source === null) {
    throw new TypeError('Cannot initialize data source with unsupported data type.');
  }

  return data_source;
};
