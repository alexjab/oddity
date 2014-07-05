var fs = require ('fs');

var csv = require ('./csv.js');

fs.createReadStream ('./municipales_codes.csv', {encoding: 'utf8'})
.pipe (csv.toLines ())
.pipe (csv.toArray ())
.pipe (csv.rotateData ())
.pipe (csv.zipHeaders ())
.pipe (csv.getAt (0))
.pipe (csv.toString ({isList: false}))
.pipe (fs.createWriteStream ('./output.csv', {encoding: 'utf8'}));

/*
fs.createReadStream ('./municipales.csv', {encoding: 'utf8'})
.pipe (csv.toLines ())
.pipe (csv.toJSON ())
.pipe (csv.mapData (function (data, index, next) {
  console.log (data, index);
  next (data);
}))
.pipe (csv.toString ())
.pipe (fs.createWriteStream ('./output.csv', {encoding: 'utf8'}));
*/
