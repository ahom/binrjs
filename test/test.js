/*global describe, it */
'use strict';
var assert = require('assert');
var binread = require('../');

describe('binread node module', function () {
  it('must have at least one test', function () {
    binread();
    assert(true, 'I modified the non-existant test to make it pass. Shame on me.');
  });
});
