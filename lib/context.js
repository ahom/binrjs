module.exports = function (data_view) {
  var dview = data_view;
  var offset = 0;

  return {
    _offset: offset,
    _dview: dview,
  }
}
