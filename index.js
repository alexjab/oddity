var fs = require ('fs');

var through = require ('through');

var Oddity = function () {
  this.csv = require ('./lib/csv.js');
};

global.fromFile = Oddity.prototype.fromFile = function (path) {
  return fs.createReadStream (path, {encoding: 'utf8'})
};

global.toFile = Oddity.prototype.toFile = function (path) {
  return fs.createWriteStream (path, {encoding: 'utf8'})
};

global.toString = Oddity.prototype.toString = function () {
  var line = 0, buffer = null;

  var stringify = function (data) {
    if (line === 0) {
      buffer = data;
    } else {
      if (buffer) {
        buffer = JSON.stringify (buffer, null, 2);
        this.queue ('[\n' + buffer.replace (/\{/, '  {').replace (/\n/g, '\n  '));
        buffer = '';
      }
      data = JSON.stringify (data, null, 2);
      this.queue (',\n' + data.replace (/\{/, '  {').replace (/\n/g, '\n  '));
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

global.mapData = exports.mapData = function (fn) {
  var line = 0;

  var map = function (data) {
    var sent = false;
    data = fn.call (null, data, line, function (data) {
      if (!sent) {
        this.queue (data);
        sent = true;
      }
    }.bind (this));
    if (!sent && typeof data !== 'undefined') {
      this.queue (data);
      sent = true;
    }
    line ++;
  };

  return through (map);
};

module.exports = new Oddity ();

