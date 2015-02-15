'use strict';

var fs = require('fs');
var sources = require('../sources');
var BufferDataView = require('./buffer_data_view');

/**
 * Source for a node file
 * @class NodeFileSource
 */
var NodeFileSource = function (filepath) {
  var fd = fs.openSync(filepath, 'r');
  var size = fs.fstatSync(fd).size;
  return {
    size: function () {
      return size;
    },
    getDataView: function (offset, length) {
      return new Promise(function (fulfill, reject) {
        var in_buffer = new Buffer(length);
        fs.read(fd, in_buffer, 0, length, offset, function (error, bytes_read, out_buffer) {
          try {
            if (error) {
              reject(error);
            } else {
              var value = new BufferDataView(out_buffer);
              fulfill(value);
            }
          } catch (err) {
            reject(err);
          }
        });
      });
    }
  };
};

/**
 * Source for a node's Buffer
 * @class BufferSource
 */
var BufferSource = function (buffer) {
  return {
    size: function () {
      return buffer.length;
    },
    getDataView: function (offset, length) {
      return new BufferDataView(buffer.slice(offset, offset + length));
    }
  };
};


module.exports = function (data) {
  var data_source = null;
  if (data instanceof Buffer) {
    data_source = new BufferSource(data);
  } else if (typeof data === 'string') {
    data_source = new NodeFileSource(data);
  }

  return data_source || sources(data);
};
