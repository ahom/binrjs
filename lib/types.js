var read_value = function (ctx, dview_func, byte_size, little_endian) {
  var value = ctx._dview[dview_func](ctx._offset, little_endian);
  ctx._offset += byte_size;
  return value;
}

module.exports = {
  // integers
  int8: function (ctx) {
    return read_value(ctx, 'getInt8', 1, true);
  },
  uint8: function (ctx) {
    return read_value(ctx, 'getUint8', 1, true);
  },
  leint16: function (ctx) {
    return read_value(ctx, 'getInt16', 2, true);
  },
  leuint16: function (ctx) {
    return read_value(ctx, 'getUint16', 2, true);
  },
  beint16: function (ctx) {
    return read_value(ctx, 'getInt16', 2, false);
  },
  beuint16: function (ctx) {
    return read_value(ctx, 'getUint16', 2, false);
  },
  leint32: function (ctx) {
    return read_value(ctx, 'getInt32', 4, true);
  },
  leuint32: function (ctx) {
    return read_value(ctx, 'getUint32', 4, true);
  },
  beint32: function (ctx) {
    return read_value(ctx, 'getInt32', 4, false);
  },
  beuint32: function (ctx) {
    return read_value(ctx, 'getUint32', 4, false);
  },

  // floats
  lefloat32: function (ctx) {
    return read_value(ctx, 'getFloat32', 4, true);
  },
  befloat32: function (ctx) {
    return read_value(ctx, 'getFloat32', 4, false);
  },
  lefloat64: function (ctx) {
    return read_value(ctx, 'getFloat64', 8, true);
  },
  befloat64: function (ctx) {
    return read_value(ctx, 'getFloat64', 8, false);
  },

  // bytes
  bytes: function (ctx, length) {
    var start = ctx._dview.byteOffset + ctx._offset;
    var value = ctx._dview.buffer.slice(start, start + length);
    ctx._offset += length;
    return value;
  }
}

module.exports.int16 = module.exports.leint16
module.exports.uint16 = module.exports.leuint16

module.exports.int32 = module.exports.leint32
module.exports.uint32 = module.exports.leuint32

module.exports.float32 = module.exports.lefloat32
module.exports.float64 = module.exports.lefloat64
