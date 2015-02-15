'use strict';

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
        return buffer.readFloatLE(offset);
      } else {
        return buffer.readFloatBE(offset);
      }
    },
    getFloat64: function (offset, little_endian) {
      if (little_endian) {
        return buffer.readDoubleLE(offset);
      } else {
        return buffer.readDoubleBE(offset);
      }
    }
  };
};

module.exports = BufferDataView;
