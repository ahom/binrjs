'use strict';

var fs = require('fs');
var sources = require('../sources');

/**
 * DataView's API for node's Buffer
 * @class BufferDataView
 */
var BufferDataView = function (buffer) {
  return {
    buffer: buffer,
    byteOffset: 0,
    byteLength: buffer.length,
    getInt8: function (offset) {
      return buffer.readInt8(offset);
    },
    getUint8: function (offset) {
      return buffer.readUInt8(offset);
    },
    getInt16: function (offset, little_endian) {
      if (little_endian) {
        return buffer.readInt16LE(offset);
      } else {
        return buffer.readInt16BE(offset);
      }
    },
    getUint16: function (offset, little_endian) {
      if (little_endian) {
        return buffer.readUInt16LE(offset);
      } else {
        return buffer.readUInt16BE(offset);
      }
    },
    getInt32: function (offset, little_endian) {
      if (little_endian) {
        return buffer.readInt32LE(offset);
      } else {
        return buffer.readInt32BE(offset);
      }
    },
    getUint32: function (offset, little_endian) {
      if (little_endian) {
        return buffer.readUInt32LE(offset);
      } else {
        return buffer.readUInt32BE(offset);
      }
    },
    getFloat32: function (offset, little_endian) {
      if (little_endian) {
        return buffer.getFloatLE(offset);
      } else {
        return buffer.getFloatBE(offset);
      }
    },
    getFloat64: function (offset, little_endian) {
      if (little_endian) {
        return buffer.getDoubleLE(offset);
      } else {
        return buffer.getDoubleBE(offset);
      }
    }
  };
};


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
    getDataView: function (offset, length, post_process) {
      return new Promise(function (fulfill, reject) {
        var in_buffer = new Buffer(length);
        fs.read(fd, in_buffer, 0, length, offset, function (error, bytes_read, out_buffer) {
          try {
            if (error) {
              reject(error);
            } else {
              var value = new BufferDataView(out_buffer);
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

/**
 * Source for a node's Buffer
 * @class BufferSource
 */
var BufferSource = function (buffer) {
  return {
    size: function () {
      return buffer.length;
    },
    getDataView: function (offset, length, post_process) {
      return new Promise(function (fulfill, reject) {
        var value = new BufferDataView(buffer.slice(offset, offset + length));
        fulfill(post_process(value));
      });
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
