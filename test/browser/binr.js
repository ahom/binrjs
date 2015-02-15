/*global File */
'use strict';

var binr = require('../../browser');
var binr_tests = require('../binr');

binr_tests.binr_tests(binr, new File([new Uint8Array(binr_tests.test_data_array)], ""), 'File (Async)');
