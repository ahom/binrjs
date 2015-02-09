'use strict';

/**
 * @class LazyValue
 */
var LazyValue = function (read_op) {
  var value = null;
  var already_read = false;
  return {
    /**
     * @returns the value, null if read has not been called yet
     */
    get: function () {
      return value;
    },

    /**
     * @returns {Promise} A promise that returns the value
     */
    read: function () {
      // If value already been read then do not reread it
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

/**
 * @class LazyValues
 */
var LazyValues = function (size, read_op) {
  var values = [];
  var already_read = 0;
  return {
    /**
     * @returns total size of the array
     */
    size: function () {
      return size;
    },

    /**
     * @returns the values already read
     */
    get: function () {
      return values;
    },

    /**
     * @param num: number of items to retrieve with this read operation
     * @returns {Promise} A promise that returns the values already read
     */
    read: function (num) {
      // If num is empty, fetch everything
      // If num is bigger than the total size, then only fetch what's available
      num = Math.min(num || size, size - already_read);
      if (num === 0) {
        // If no more values to be read, do not reread and return the values
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
