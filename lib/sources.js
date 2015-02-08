/*global File, FileReader, FileReaderSync*/
'use strict';

var fs = require('fs');
var util = require('util');

var NodeFileSource = function (filepath) {
  var fd = fs.openSync(filepath, 'r');
  var size = util.inspect(fs.statSync(fd)).size;
  return {
    size: function () {
      return size;
    },
    getDataView: function (offset, length) {
      return new Promise(function (fulfill, reject, post_process) {
        var in_buffer = new Buffer(length);
        fs.read(fd, in_buffer, 0, length, offset, function (error, bytes_read, out_buffer) {
          try {
            if (error) {
              reject(error);
            } else {
              var value = new DataView(out_buffer);
              fulfill(post_process(value));
            }
          } catch (err) {
            reject(err);
          }
        });
      });
    }
  };
};

var FileReaderSyncSource = function (file) {
  return {
    size: function () {
      return file.size;
    },
    getDataView: function (offset, length) {
      return new Promise(function (fulfill, reject, post_process) {
        var file_reader = new FileReaderSync();
        var value = new DataView(file_reader.readAsArrayBuffer(file.slice(offset, offset + length)));
        fulfill(post_process(value));
      });
    }
  };
};

var FileReaderSource = function (file) {
  return {
    size: function () {
      return file.size;
    },
    getDataView: function (offset, length) {
      return new Promise(function (fulfill, reject, post_process) {
        var file_reader = new FileReader();
        file_reader.onloadend = function (e) {
          try {
            if (file_reader.error) {
              reject(file_reader.error);
            } else if (file_reader.result) {
              var value = new DataView(file_reader.result);
              fulfill(post_process(value));
            } else {
              reject(new Error('FileError: Nothing returned after read.'));
            }
          } catch (err) {
            reject(err);
          }
        };
        file_reader.readAsArrayBuffer(file.slice(offset, offset + length));
      });
    }
  };
};

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

var is_node =  (typeof(process) !== 'undefined' && process.title === 'node');
var is_html_file_api_present = (typeof(File) !== 'undefined');
var is_html_file_reader_api_present = (is_html_file_api_present && (typeof(FileReader) !== 'undefined'));
var is_html_file_reader_sync_api_present = (is_html_file_api_present && (typeof(FileReaderSync) !== 'undefined'));

module.exports = function (data) {
  var data_source = null;
  if (data instanceof Array) {
    data_source = new ArrayBufferSource(new Uint8Array(data).buffer);
  } else if (data instanceof ArrayBuffer) {
    data_source = new ArrayBufferSource(data);
  } else if (data instanceof Buffer) {
    data_source = new ArrayBufferSource(data);
  } else if (!is_node && is_html_file_api_present && data instanceof File) {
    if (is_html_file_reader_api_present) {
      data_source = new FileReaderSource(data);
    } else if (is_html_file_reader_sync_api_present) {
      data_source = new FileReaderSyncSource(data);
    }
  } else if (is_node && typeof data === 'string') {
    data_source = new NodeFileSource(data);
  }

  if (data_source === null) {
    throw new TypeError('Cannot initialize data source with unsupported data type. Supported types are Arrays[0x00-0xFF]/ArrayBuffers/File(Browser)/FilePath(node)/Buffer(node).');
  }

  return data_source;
};
