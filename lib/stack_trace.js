'use strict';

module.exports = function (parent, type, args, offset) {
  return {
    parent: parent,
    type: {
      func: type,
      args: args
    },
    offset: offset,
    value: null,
    size: null,
    children: []
  };
};
