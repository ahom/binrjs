'use strict';

var read_value = function (ctx, dview_func, byte_size, little_endian, callback) {
  var value = ctx.getDataView(byte_size)[dview_func](0, little_endian);
  ctx.skip(byte_size);
  return value;
}

module.exports = {
  // integers
  int8: function () {
    return read_value(this, 'getInt8', 1, true);
  },
  uint8: function () {
    return read_value(this, 'getUint8', 1, true);
  },
  leint16: function () {
    return read_value(this, 'getInt16', 2, true);
  },
  leuint16: function () {
    return read_value(this, 'getUint16', 2, true);
  },
  beint16: function () {
    return read_value(this, 'getInt16', 2, false);
  },
  beuint16: function () {
    return read_value(this, 'getUint16', 2, false);
  },
  leint32: function () {
    return read_value(this, 'getInt32', 4, true);
  },
  leuint32: function () {
    return read_value(this, 'getUint32', 4, true);
  },
  beint32: function () {
    return read_value(this, 'getInt32', 4, false);
  },
  beuint32: function () {
    return read_value(this, 'getUint32', 4, false);
  },

  // floats
  lefloat32: function () {
    return read_value(this, 'getFloat32', 4, true);
  },
  befloat32: function () {
    return read_value(this, 'getFloat32', 4, false);
  },
  lefloat64: function () {
    return read_value(this, 'getFloat64', 8, true);
  },
  befloat64: function () {
    return read_value(this, 'getFloat64', 8, false);
  },

  // bytes
  bytes: function (length) {
    var dview = this.getDataView(length);
    var value = dview.buffer.slice(dview.byteOffset, dview.byteOffset + length);
    this.skip(length);
    return new Uint8Array(value);
  }
}

module.exports.int16 = module.exports.leint16
module.exports.uint16 = module.exports.leuint16

module.exports.int32 = module.exports.leint32
module.exports.uint32 = module.exports.leuint32

module.exports.float32 = module.exports.lefloat32
module.exports.float64 = module.exports.lefloat64
