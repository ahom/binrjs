'use strict';

var fs = require('fs');
var binr = require('../..');
var binr_tests = require('../binr');

binr_tests.binr_tests(binr, new Buffer(binr_tests.test_data_array), 'Buffer');

var filename = 'test_binr.tmp';
var fd = fs.openSync(filename, 'w');
fs.writeSync(fd, new Buffer(binr_tests.test_data_array), 0, binr_tests.test_data_array.length);
fs.closeSync(fd);
binr_tests.binr_tests(binr, filename, 'NodeFile');
