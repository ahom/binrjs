/*jslint bitwise: true */
'use strict';

var TextDecoder = require('text-encoding').TextDecoder;

var read_value = function (ctx, dview_func, byte_size, little_endian) {
  return ctx.getDataView(byte_size, function (dview) {
    ctx.skip(byte_size);
    return dview[dview_func](0, little_endian);
  });
};

// Computes a float16 into a JS double from 2 bytes
var compute_float16 = function (hi, lo) {
  var sign = 1 - 2 * ((hi & 0x80) >> 7);
  var exponent = (hi & 0x7C) >> 2;
  var significand = ((hi & 0x03) << 8) | lo;

  var value = null;
  if (exponent === 0x1F) {
    if (significand === 0x00) {
      value = sign * Infinity;
    } else {
      value = NaN;
    }
  } else if (exponent === 0x00) {
    if (significand === 0) {
      value = sign * 0;
    } else {
      // subnormal form
      value = sign * 6.103515625e-5 * (significand / 0x400);
    }
  } else {
    // normal form
    value = sign * Math.pow(2, exponent - 15) * (1 + significand / 0x400);
  }
  return value;
};

// Checks that view of buffer is null or not
var is_dview_null = function (buffer, offset, size) {
  offset = offset || 0;
  size = size || buffer.length;
  for (var i = offset; i < size; i++) {
    if (buffer[i] !== 0x00) {
      return false;
    }
  }
  return true;
};

// string type
var string = function* (encoding, byte_size, length) {
  length = length || 0;
  var bytes = null;
  if (length) {
    // In case the length has been provided
    bytes = yield this.read_with_args(module.exports.bytes)(length * byte_size);
  } else {
    // If no length read item by item
    bytes = [];
    var item = null;
    do {
      item = yield this.read_with_args(module.exports.bytes)(byte_size);
      for (var i = 0; i < byte_size; i++) {
        bytes.push(item[i]);
      }
    // Stops if the next item is null
    } while (!is_dview_null(item));
    bytes = new Uint8Array(bytes);
  }
  // If last item is null, remove it before decoding the string
  if (is_dview_null(bytes, bytes.length - byte_size)) {
    bytes = bytes.subarray(0, bytes.length - byte_size);
  }
  return new TextDecoder(encoding).decode(bytes);
};

module.exports = {
  // integers
  int8: function* () {
    return read_value(this, 'getInt8', 1, true);
  },
  uint8: function* () {
    return read_value(this, 'getUint8', 1, true);
  },
  leint16: function* () {
    return read_value(this, 'getInt16', 2, true);
  },
  leuint16: function* () {
    return read_value(this, 'getUint16', 2, true);
  },
  beint16: function* () {
    return read_value(this, 'getInt16', 2, false);
  },
  beuint16: function* () {
    return read_value(this, 'getUint16', 2, false);
  },
  leint32: function* () {
    return read_value(this, 'getInt32', 4, true);
  },
  leuint32: function* () {
    return read_value(this, 'getUint32', 4, true);
  },
  beint32: function* () {
    return read_value(this, 'getInt32', 4, false);
  },
  beuint32: function* () {
    return read_value(this, 'getUint32', 4, false);
  },

  // floats
  lefloat16: function* () {
    var self = this;
    return this.getDataView(2, function (dview) {
      self.skip(2);
      return compute_float16(dview.getUint8(1), dview.getUint8(0));
    });
  },
  befloat16: function* () {
    var self = this;
    return this.getDataView(2, function (dview) {
      self.skip(2);
      return compute_float16(dview.getUint8(0), dview.getUint8(1));
    });
  },
  lefloat32: function* () {
    return read_value(this, 'getFloat32', 4, true);
  },
  befloat32: function* () {
    return read_value(this, 'getFloat32', 4, false);
  },
  lefloat64: function* () {
    return read_value(this, 'getFloat64', 8, true);
  },
  befloat64: function* () {
    return read_value(this, 'getFloat64', 8, false);
  },

  // bytes
  bytes: function* (length) {
    var self = this;
    return this.getDataView(length, function (dview) {
      self.skip(length);
      return new Uint8Array(dview.buffer.slice(dview.byteOffset, dview.byteOffset + length));
    });
  },

  // strings
  string8: function (length) {
    return string.apply(this, ['utf-8', 1, length]);
  },

  lestring16: function (length) {
    return string.apply(this, ['utf-16le', 2, length]);
  },

  bestring16: function (length) {
    return string.apply(this, ['utf-16be', 2, length]);
  }
};

module.exports.int16 = module.exports.leint16;
module.exports.uint16 = module.exports.leuint16;

module.exports.int32 = module.exports.leint32;
module.exports.uint32 = module.exports.leuint32;

module.exports.float16 = module.exports.lefloat16;
module.exports.float32 = module.exports.lefloat32;
module.exports.float64 = module.exports.lefloat64;

module.exports.string = module.exports.string8;
module.exports.string16 = module.exports.lestring16;
