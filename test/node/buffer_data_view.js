/*global describe, it */
'use strict';

var assert = require('assert');
var BufferDataView = require('../../lib/node/buffer_data_view');

describe('binr', function () {
  it('BufferDataView', function () {
    var buffer = new Buffer(8);
    var dview = new BufferDataView(buffer);

    buffer.writeUInt8(255, 0);
    assert.equal(dview.getUint8(buffer), 255);

    buffer.writeInt8(-127, 0);
    assert.equal(dview.getInt8(buffer), -127);

    buffer.writeUInt16LE(65535, 0);
    assert.equal(dview.getUint16(buffer, true), 65535);
    buffer.writeUInt16BE(65535, 0);
    assert.equal(dview.getUint16(buffer, false), 65535);

    buffer.writeInt16LE(-32767, 0);
    assert.equal(dview.getInt16(buffer, true), -32767);
    buffer.writeInt16BE(-32767, 0);
    assert.equal(dview.getInt16(buffer, false), -32767);

    buffer.writeUInt32LE(4294967295, 0);
    assert.equal(dview.getUint32(buffer, true), 4294967295);
    buffer.writeUInt32BE(4294967295, 0);
    assert.equal(dview.getUint32(buffer, false), 4294967295);

    buffer.writeInt32LE(-2147483647, 0);
    assert.equal(dview.getInt32(buffer, true), -2147483647);
    buffer.writeInt32BE(-2147483647, 0);
    assert.equal(dview.getInt32(buffer, false), -2147483647);

    buffer.writeFloatLE(-1.0, 0);
    assert.equal(dview.getFloat32(buffer, true), -1.0);
    buffer.writeFloatBE(-1.0, 0);
    assert.equal(dview.getFloat32(buffer, false), -1.0);

    buffer.writeDoubleLE(-1.0, 0);
    assert.equal(dview.getFloat64(buffer, true), -1.0);
    buffer.writeDoubleBE(-1.0, 0);
    assert.equal(dview.getFloat64(buffer, false), -1.0);
  });
});
