oddity
======

A streaming Open Data toolkit

##What is Oddity ?
Oddity provides tool for extracting and formatting Open Data; it is based on streams.

##How to use it ?

###Installation
```
npm install oddity
```

###Sample `Oddfile.js` for CSV data
```
var odd = require('oddity');

var csv = odd.csv;

fromFile('examples/colors.csv')
.pipe(csv.splitLines())
.pipe(csv.toArray())
.pipe(csv.zipHeader())
.pipe(toString())
.pipe(toFile('output.json'))
```

###Execution
```
node Oddfile.js
```
Or if you also intalled oddity globally, just go to the folder containing your `Oddfile.js`:
```
oddity
```

##Documentation

###Oddity

####.fromFile

Returns a readStream from an input file.

`.fromFile(input)`

Parameters:

 - `input`: the name of the input file.

Alias: `fromFile`

####.toFile

Returns a writeStream stream to an output file.

`.toFile(output)`

Parameters:

 - `output`: the name of the output file.

Alias: `toFile`

####.toString

Stringifies an Object.

Alias: `toString`

####.map

Applies a map function to the data. The function must `return` something.

`.map(data, index)`

Parameters:

 - `data`: the data,
 - `index`: the index of the data.

Alias: `map`

Example:
```
.pipe(map(function (data, index) {
  data['age'] = parseInt(data['age']);
  return data;
}))
//-> {name: 'Alex', age: '23'} => {name: 'Alex', age: 23}
```

###CSV

A CSV toolkit. You can use it via `oddity.csv`;

Commented sample `Oddfile.js`:
```
var odd = require('oddity');

var csv = odd.csv; // optional, avoids repeating odd.csv later

fromFile('examples/colors.csv') // read from the input file
.pipe(csv.splitLines()) // split the file in lines
.pipe(csv.toArray()) // split each line in arrays
.pipe(csv.zipHeader()) // zip each line with the header
.pipe(toString()) // stringify the JSON
.pipe(toFile('output.json')) // write to the output file
```

####.splitLines
Splits the lines of a CSV file.

`.splitLines([options])`

Options:

 - `separator`: a String that separates data on each line (defaults to `,`)

Example:
```
.pipe(csv.splitLines({separator: '\r\n'}))
//-> "foo\r\nbar\r\nbaz" => 'foo' -> 'bar' -> 'baz' 
```

####.toArray
Splits a string into an array.

`.toArray([options])`

Options:

 - `start`: the index of the first data to work on (defaults to `0` (the first one)),
 - `end`: the index of the last data to work on (defaults to `null` (the last one)),
 - `separator`: a String that separates data on each line (defaults to `,`),
 - `quote`: a String that escapes data that contains a separator (defaults to `"`).

Example:
```
//=> pipe(csv.toArray())
//-> "foo,bar,baz" => ['foo', 'bar', 'baz']
```

####.zipHeader
Merges a data Array with a header Array. By default, the header is the first Array that goes through the stream.

`.zipHeader([options])`

Options:

 - `start`: the index of the first data to work on (defaults to `0` (the first one)),
 - `end`: the index of the last data to work on (defaults to `null` (the last one)),
 - `headerIndex`: the index of the header Array (defaults to `0` (the first Array)); if the header is located among the data, the data is buffered to be correctly zipped later,
 - `header`: an Array of Strings that defines the header (defaults to the first Array or the Array at `headerIndex`).

Example:
```
pipe(csv.zipHeader())
//-> ['foo', 'bar', 'baz'] -> ['medical', 'campaign', 'awaiting'] -> ['reasoning', 'second', 'remarked']
//=> {foo: 'medical', bar: 'campaign', baz: 'awaiting'} -> {foo: 'reasoning', bar: 'second', baz: 'remarked'}
```

####.rotateData
Rotates an array of arrays.

Example:
```
Before rotation:
----------------
// ['iso', 'name'] -> ['FI', 'Finland'] -> ['FR', 'France'] -> ['MA', 'Morocco'] -> ['ES', 'Spain']
//=> .pipe(rotateData())
//=> .pipe(zipHeader())
// {iso: 'FI', name: 'Finland'} -> {iso: 'FR', name: 'France'} -> {iso: 'MA', name: 'Morocco'} -> {iso: 'ES', name: 'Spain'}

After rotation:
---------------
// ['iso', 'FI', 'FR','MA', 'ES'] -> ['name', 'Finland', 'France', 'Morocco', 'Spain']
//=> .pipe(rotateData())
//=> .pipe(zipHeader())
// {FI: 'Finland', FR: 'France', MA: 'Morocco', ES: 'Spain'}

```

##Testing
Testing is done using mocha and should. You can run them by typing:
```
make test
```