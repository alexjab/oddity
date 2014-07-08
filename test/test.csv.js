var should = require ('should');
var thebulk = require ('thebulk');
var through = require ('through');

var csv = require ('../lib/csv.js');

describe ('lib/csv.js', function () {
  describe ('.splitLines', function () {
    it ('should split chunk data into lines', function (done) {
      var ws = through ();
      var line = 0;

      var line1 = thebulk.more (thebulk.word).join (',');
      var line2 = thebulk.more (thebulk.word).join (',');
      var line3 = thebulk.more (thebulk.word).join (',');
      var chunk = [line1, line2, line3].join ('\n');

      ws
      .pipe (csv.splitLines ())
      .pipe (through (function (data) {
        if (line === 0)
          data.should.equal (line1);
        if (line === 1)
          data.should.equal (line2);
        if (line === 2)
          data.should.equal (line3);
        line++;
      }))
      .on ('end', function () {
        done ();
      });

      ws.queue (chunk);
      ws.queue (null);
    });
  });

  describe ('.toArray', function () {
    it ('should split a string into an array', function (done) {
      var ws = through ();
      var input = 'months,go,lover,itself,authoritative,operatic,cloud,watch,neat,firelight';

      ws
      .pipe (csv.toArray ())
      .on ('data', function (data) {
        data.should.eql (['months', 'go', 'lover', 'itself', 'authoritative', 'operatic', 'cloud', 'watch', 'neat', 'firelight']);
      })
      .on ('end', function () {
        done ();
      });

      ws.queue (input);
      ws.queue (null);
    });
  });

  describe ('.zipHeader', function () {
    it ('should zip the header with every line', function (done) {
      var ws = through ();
      var line1 = thebulk.more (thebulk.word);
      var line2 = thebulk.more (thebulk.word);
      var line3 = thebulk.more (thebulk.word);

      var index = 0;

      ws
      .pipe (csv.zipHeader())
      .on ('data', function (data) {
        Object.keys (data).should.eql (line1);
        if (index === 0)
          Object.keys (data).map (function (key) {return data[key];}).should.eql (line2);
        if (index === 1)
          Object.keys (data).map (function (key) {return data[key];}).should.eql (line3);
        index++;
      })
      .on ('end', function (data) {
        done ();
      })
      ws.queue (line1);
      ws.queue (line2);
      ws.queue (line3);
      ws.queue (null);
    });
  });
  
  describe ('.rotateData', function () {
    it ('should rotate a matrix', function (done) {
      var input = thebulk.more (function () {
        return thebulk.more (thebulk.word);
      });

      var ws = through ();
      var index = 0;

      ws
      .pipe (csv.rotateData ())
      .on ('data', function (data) {
        var expected = [];
        if (index === 0) {
          for (var i = 0; i< input.length; i++) {
            expected.push (input[i][0]);
          }
          data.should.eql (expected);
        }
        if (index === 1) {
          for (var i = 0; i< input.length; i++) {
            expected.push (input[i][1]);
          }
          data.should.eql (expected);
        }
        index++;
      })
      .on ('end', function (data) {
        done ();
      });
      input.forEach (function (d) {
        ws.queue (d);
      });
      ws.queue (null);
    });
  });
});
