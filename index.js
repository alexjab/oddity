var fs = require ('fs');

var through = require ('through');

var consolation = require ('consolation');
var console = new consolation ({title: 'oddity', use_symbols: false, use_time: false});

var Oddity = function () {
  this.csv = require ('./lib/csv.js');
};

global.fromFile = Oddity.prototype.fromFile = function (path) {
  console.info ('Reading file '+path);
  return fs.createReadStream (path, {encoding: 'utf8'})
};

global.toFile = Oddity.prototype.toFile = function (path) {
  console.info ('Writing file '+path);
  return fs.createWriteStream (path, {encoding: 'utf8'})
};

global.toString = Oddity.prototype.toString = function () {
  var line = 0, buffer = null;

  var indent = function (string) {
    return string.split ('\n').reduce (function (memo, line, index, list) {
      memo += '  '+line;
      if (index !== list.length - 1) {
        memo += '\n';
      }
      return memo;
    }, '');
  };

  var stringify = function (data) {
    if (line === 0) {
      buffer = data;
    } else {
      if (buffer) {
        buffer = JSON.stringify (buffer, null, 2);
        buffer = '[\n' + indent (buffer);
        this.queue (buffer);
        buffer = '';
      }
      data = JSON.stringify (data, null, 2);
      data = ',\n' + indent (data);
      this.queue (data);
    }
    line++;
  };

  var end = function () {
    if (!buffer) {
      this.queue ('\n]');
    } else {
      buffer = JSON.stringify (buffer, null, 2);
      this.queue (buffer);
    }
    this.queue (null);
  };

  return through (stringify, end);
};

global.toXML = Oddity.prototype.toXML = function () {
  var line = 0, buffer = null;

  var to_xml = function (data) {
    if (line === 0) {
      buffer = data;
    } else {
      if (buffer) {
        var record = Object.keys (data).reduce (function (memo, key, index) {
          memo += '  <'+key+'>' + data[key] + '</'+key+'>\n';
          return memo;
        }, '<collection>\n  <object>\n') + '</object>\n';

        this.queue (record);
        buffer = null;
      }
      var record = Object.keys (data).reduce (function (memo, key, index) {
        memo += '    <'+key+'>' + data[key] + '</'+key+'>\n';
        return memo;
      }, '  <object>\n') + '  </object>\n';

      this.queue (record);
    }
    line++;
  };

  var end = function () {
    if (!buffer) {
      this.queue ('</collection>');
    } else {
      var record = Object.keys (buffer).reduce (function (memo, key, index) {
        memo += '  <'+key+'>' + buffer[key] + '</'+key+'>\n';
        return memo;
      }, '<object>\n') + '</object>\n';
      this.queue (record);
    }
    this.queue (null);
  };

  return through (to_xml, end);
};

global.pluckLine = exports.pluckLine = function (index) {
  var line = 0;
  var get = function (data) {
    if (line === index) {
      this.queue (data);
    }
    line++;
  };

  return through (get);
}

global.mapData = global.map = exports.map = exports.mapData = function (fn) {
  var line = 0;

  var map_data = function (data) {
    data = fn.call (null, data, line);
    if (typeof data !== 'undefined') {
      this.queue (data);
    }
    line ++;
  };

  return through (map_data);
};

global.mapFields = exports.mapFields = function () {
  line = 0;
  var args = arguments;
  var fn = args[args.length - 1];

  var map = function (data) {
    for (var i = 0; i < args.length-1; i++) {
      var field = args[i];
      data[field] = fn.call (null, data[field]);
    }
    this.queue (data);
  };

  return through (map);
};

module.exports = new Oddity ();
