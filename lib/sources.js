'use strict';

var FileApiSource = function (file) {
  return {
    size: function () {
      return file.size;
    },
    getDataView: function (offset, length) {
      return new Promise(function (fulfill, reject, post_process) {
        var file_reader = FileReader();
        file_reader.onloadend = function (e) {
          if (file_reader.error) {
            reject(file_reader.error);
          } else if (file_reader.result) {
            var value = new DataView(file_reader.result);
            value = post_process(value);
            fulfill(value);
          } else {
            reject(new Error('FileError: Nothing returned at end of read.'));
          }
        };
        file_reader.readAsArrayBuffer(file.slice(offset, offset + length));
      });
    }
  };
}


var ArrayBufferSource = function (array_buffer) {
  return {
    size: function () {
      return array_buffer.byteLength;
    },
    getDataView: function (offset, length, post_process) {
      return new Promise(function (fulfill, reject) {
        var value = new DataView(array_buffer, offset, length);
        value = post_process(value);
        fulfill(value);
      });
    }
  };
}

var is_node =  (typeof(process) !== 'undefined' && process.title === 'node');

module.exports = function (data) {
  // Need to handle File (browser) / ArrayBuffer / Array of Bytes / filename (nodejs)

  var data_source = null;
  if (data instanceof Array) {
    data_source = new ArrayBufferSource(new Uint8Array(data).buffer);
  } else if (data instanceof ArrayBuffer) {
    data_source = new ArrayBufferSource(data);
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
