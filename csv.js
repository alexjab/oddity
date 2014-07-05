var fs = require ('fs');

var through = require ('through');

var fromFile = exports.fromfile = function (path) {
  return fs.createReadStream (path, {encoding: 'utf8'})
};

var toFile = exports.toFile = function (path) {
  return fs.createWriteStream (path, {encoding: 'utf8'})
};

var toLines = exports.toLines = function (options) {
  options = options || {};
  var separator = options.separator || '\n';

  var buffer = '', line = 0;

  var split = function (data) {
    data = (buffer + data).split ('\n')
    buffer = data.pop ();
    data.forEach (function (line) {
      this.queue (line);
    }.bind (this));
  };

  return through (split);
};

var toArray = exports.toArray = function (options) {
  options = options || {};
  var start = options.start || 0;
  var end = options.end || null;
  var separator = options.separator || ',';
  var quote = options.quote || '"';

  var line = 0;

  var split = function (data) {
    if (data.indexOf (quote) !== -1) {
      var _data = '';
      var quoteOpen = false;
      for (var i = 0; i < data.length; i++) {
        if (data[i] === quote) {
          quoteOpen = !quoteOpen;
        }

        if (!quoteOpen && data[i] === separator) {
          if (data[i-1] !== quote) {
            _data += quote;
          }
          _data += separator;
          if (data[i+1] !== quote) {
            _data += quote;
          }
        } else {
          if (!(i === data.length - 1 && data[i] === quote)) {
            _data += data[i];
          }
        }
      }
      return _data.split (quote+separator+quote);
    }
    return data.split (separator);
  };

  var to_array = function (data) {
    if (line >= start && (!end || line <= end)) {
      this.queue (split (data));
    }
    line++;
  };

  return through (to_array);
};

var zipHeaders = exports.zipHeaders = function (options) {
  options = options || {};
  var start = options.start || 0;
  var end = options.end || null;
  var header = options.header || start;

  var _header = [], headerBuffer = [], line = 0;

  var zip = function (data) {
    return data.reduce (function (memo, val, index) {
      memo[_header[index]] = val
      return memo;
    }, {});
  };

  var zip_headers = function (data) {
    if (line >= start && (end === null || line <= end)) {
      if (line === header) {
        _header = data;
      } else {
        if (_header.length) {
          if (headerBuffer.length) {  
            var _data;
            while (_data = headerBuffer.shift ()) {
              this.queue (zip (_data));
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

  var _end = function () {
    headerBuffer.forEach (function (data) {
      this.queue (zip (data));
    }.bind (this));
    this.queue (null);
  };

  return through (zip_headers, _end);
};

var toString = exports.toString = function (options) {
  options = options || {};
  isList = options.isList === false?false:true;

  var line = 0;

  var stringify = function (data) {
    var data = (JSON.stringify (data, null, 2));
    if (isList) {
      if (line === 0) {
        this.queue ('[\n');
      } else {
        this.queue (',\n');
      }
      this.queue (data.replace (/\{/, '  {').replace (/\n/g, '\n  '));
    } else {
      this.queue (data);
    }
    line++;
  }

  var end = function () {
    if (isList) {
      this.queue ('\n]');
    }
    this.queue (null);
  };

  return through (stringify, end);
};

var mapData = exports.mapData = function (fn) {
  var line = 0;

  var map = function (data) {
    fn.call (null, data, line, function (data) {
      this.queue (data);
    }.bind (this));
    line ++;
  };

  return through (map);
};

var rotateData = exports.rotateData = function () {
  var matrix = [];
  var _matrix;

  var buffer_data = function (data) {
    matrix.push (data);
  };

  var rotate = function () {
    _matrix = new Array (matrix[0].length);
    matrix.forEach (function (line, index) {
      line.forEach (function (value, jndex) {
        if (index === 0) {
          _matrix[jndex] = [];
        }
        _matrix[jndex][index] = value;
      });
    });
    _matrix.forEach (function (data) {
      this.queue (data);
    }.bind (this));
    this.queue (null);
  };

  return through (buffer_data, rotate);  
};

var getAt = exports.getAt = function (index) {
  var line = 0;
  var get = function (data) {
    if (line === index) {
      this.queue (data);
    }
    line++;
  };

  return through (get);
}
