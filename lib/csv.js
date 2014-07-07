var fs = require ('fs');

var through = require ('through');

var splitLines = exports.splitLines = function (options) {
  options = options || {};
  var _separator = options.separator || '\n';

  var buffer = '', line = 0;

  var split = function (data) {
    data = (buffer + data).split (_separator)
    buffer = data.pop ();
    data.forEach (function (line) {
      this.queue (line);
    }.bind (this));
  };

  return through (split);
};

var toArray = exports.toArray = function (options) {
  options = options || {};
  var _start = options.start || 0;
  var _end = options.end || null;
  var _separator = options.separator || ',';
  var _quote = options.quote || '"';

  var line = 0;

  var split = function (data) {
    if (data.indexOf (_quote) !== -1) {
      var _data = '';
      var quoteOpen = false;
      for (var i = 0; i < data.length; i++) {
        if (data[i] === _quote) {
          quoteOpen = !quoteOpen;
        }

        if (!quoteOpen && data[i] === _separator) {
          if (data[i-1] !== _quote) {
            _data += _quote;
          }
          _data += _separator;
          if (data[i+1] !== _quote) {
            _data += _quote;
          }
        } else {
          if (!((i === data.length - 1 && data[i] === _quote)||(i === 0 && data[i] === _quote))) {
            _data += data[i];
          }
        }
      }
      return _data.split (_quote+_separator+_quote);
    }
    return data.split (_separator);
  };

  var to_array = function (data) {
    if (line >= _start && (!_end || line <= _end)) {
      this.queue (split (data));
    }
    line++;
  };

  return through (to_array);
};

var zipHeader = exports.zipHeader = function (options) {
  options = options || {};
  var _start = options.start || 0;
  var _end = options.end || null;
  var _headerIndex = options.headerIndex || _start;
  var _header = options.header || [];

  var headerBuffer = [], line = 0;

  var zip = function (data) {
    return data.reduce (function (memo, val, index) {
      memo[_header[index]] = val
      return memo;
    }, {});
  };

  var zip_headers = function (data) {
    if (line >= _start && (_end === null || line <= _end)) {
      if (line === _headerIndex) {
        if (!_header.length) {
          _header = data;
        }
      } else {
        if (_header.length) {
          if (headerBuffer.length) {  
            var record;
            while (record = headerBuffer.shift ()) {
              this.queue (zip (record));
            }
          }
          var object = zip (data);
          this.queue (object);
        } else {
          headerBuffer.push (data);
        }
      }
    }
    line++;
  };

  var end = function () {
    headerBuffer.forEach (function (data) {
      this.queue (zip (data));
    }.bind (this));
    this.queue (null);
  };

  return through (zip_headers, end);
};

var rotateData = exports.rotateData = function () {
  var matrix = [];
  var tmpMatrix;

  var buffer_data = function (data) {
    matrix.push (data);
  };

  var rotate = function () {
    tmpMatrix = new Array (matrix[0].length);
    matrix.forEach (function (line, index) {
      line.forEach (function (value, jndex) {
        if (index === 0) {
          tmpMatrix[jndex] = [];
        }
        tmpMatrix[jndex][index] = value;
      });
    });
    tmpMatrix.forEach (function (data) {
      this.queue (data);
    }.bind (this));
    this.queue (null);
  };

  return through (buffer_data, rotate);  
};

var autoLoad = exports.autoLoad = function (input, output, options) {
  options = options || {};
  var _lineSeparator = options.lineSeparator || null;
  var _separator = options.separator || null;
  var _quote = options.quote || null;
  var _headerIndex = options.headerIndex || null;
  var _header = options.header || null;

  return fromFile (input)
  .pipe (splitLines ({separator: _lineSeparator}))
  .pipe (toArray ({separator: _separator, quote: _quote}))
  .pipe (zipHeader ({header: _header, headerIndex: _headerIndex}))
  .pipe (toString ())
  .pipe (toFile (output));
}
