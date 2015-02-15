/*global FileReaderSync, FileReader, File */
'use strict';

var sources = require('../sources');

/**
 * Source for HTML File in a web worker
 * @class FileReaderSyncSource
 */
var FileReaderSyncSource = function (file) {
  return {
    size: function () {
      return file.size;
    },
    getDataView: function (offset, length) {
      return new DataView(new FileReaderSync().readAsArrayBuffer(file.slice(offset, offset + length)));
    }
  };
};

/**
 * Source for HTML File not in a web worker
 * @class FileReaderSource
 */
var FileReaderSource = function (file) {
  return {
    size: function () {
      return file.size;
    },
    getDataView: function (offset, length) {
      return new Promise(function (fulfill, reject) {
        var file_reader = new FileReader();
        file_reader.onloadend = function (e) {
          try {
            if (file_reader.error) {
              reject(file_reader.error);
            } else if (file_reader.result) {
              var value = new DataView(file_reader.result);
              fulfill(value);
            } else {
              reject(new Error('FileError: Nothing returned after read.'));
            }
          } catch (err) {
            reject(err);
          }
        };
        file_reader.readAsArrayBuffer(file.slice(offset, offset + length));
      });
    }
  };
};

var is_html_file_api_present = (typeof(File) !== 'undefined');
var is_html_file_reader_api_present = (is_html_file_api_present && (typeof(FileReader) !== 'undefined'));
var is_html_file_reader_sync_api_present = (is_html_file_api_present && (typeof(FileReaderSync) !== 'undefined'));

module.exports = function (data) {
  var data_source = null;
  if (is_html_file_api_present && data instanceof File) {
    if (is_html_file_reader_api_present) {
      data_source = new FileReaderSource(data);
    } else if (is_html_file_reader_sync_api_present) {
      data_source = new FileReaderSyncSource(data);
    }
  }
  return data_source || sources(data);
};
