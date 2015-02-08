'use strict';

var LazyValue = function (read_op) {
  var value = null;
  var already_read = false;
  return {
    get: function () {
      return value;
    },
    read: function () {
      if (already_read) {
        return Promise.resolve(value);
      } else {
        already_read = true;
        return new Promise(function (fulfill, reject) {
          read_op().then(function (val) {
            value = val;
            fulfill(val);
          }).catch(reject);
        });
      }
    }
  };
};

var LazyValues = function (size, read_op) {
  var values = [];
  var already_read = 0;
  return {
    size: function () {
      return size;
    },
    get: function () {
      return values;
    },
    read: function (num) {
      num = Math.min(num || size, size - already_read);
      if (num === 0) {
        return Promise.resolve(values);
      } else {
        already_read += num;
        return new Promise(function (fulfill, reject) {
          read_op(num).then(function (vals) {
            values = values.concat(vals);
            fulfill(values);
          }).catch(reject);
        });
      }
    }
  };
};

module.exports = {
  LazyValue: LazyValue,
  LazyValues: LazyValues
};
