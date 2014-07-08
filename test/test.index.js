var should = require ('should');
var thebulk = require ('thebulk');
var through = require ('through');

var odd = require ('../index.js');

describe ('index.js', function () {
  describe ('.toString', function () {
    it ('should stringify an object', function (done) {
      var input = thebulk.obj ();
      var ws = through ();
      ws
      .pipe (odd.toString ())
      .pipe (through (function (data) {
        data.should.equal (JSON.stringify (input, null, 2));
        done ();
      }));
      ws.queue (input);
      ws.queue (null);
    });

    it ('should stringify a list of objects', function (done) {
      var obj1 = thebulk.obj (), obj2 = thebulk.obj (), obj3 = thebulk.obj ();
      var input = [obj1, obj2, obj3];
      var ws = through ();
      var buffer = '';
      ws
      .pipe (odd.toString ())
      .pipe (through (function (data) {
        buffer += data;
      })).on ('end', function () {
        buffer.should.equal (JSON.stringify ([obj1, obj2, obj3], null, 2));
        done ();
      });
      ws.queue (obj1);
      ws.queue (obj2);
      ws.queue (obj3);
      ws.queue (null);
    });
  });

  describe ('.mapData', function () {
    it ('should apply a map function to the data', function (done) {
      var ws = through ();
      var line = 0;
      var input = [thebulk.word (), thebulk.int (), '4815162342'];
      ws
      .pipe (mapData (function (data, index) {
        if (index === 0)
          return 'string: '+data;
        if (index === 1)
          return data*data;
        if (index === 2)
          return parseInt (data);
      }))
      .pipe (through (function (data) {
        if (line === 0)
          data.should.equal ('string: '+input[0]);
        if (line === 1)
          data.should.equal (input[1]*input[1]);
        if (line === 2)
          data.should.equal (parseInt (input[2]));
        line++;
        this.queue (data);
      }))
      .on ('end', function () {
        done ();
      });
      ws.queue (input[0]);
      ws.queue (input[1]);
      ws.queue (input[2]);
      ws.queue (null);
    });
  });
});
