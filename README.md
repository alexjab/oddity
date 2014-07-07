
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

As seen in the example above, there are several sorts of methods, that are identified by the type of data they take in input:

 - chunk methods, that get data straight from a file,
 - String methods, that get String data and do things to it,
 - Array methods, that get Array data,
 - Object methods, that get any kind of Object data.

Most of them are very straightforward, since they perform specific actions, but you can still check examples to make sure you handling the right kind of data.

###Oddity

####.fromFile

Returns a readStream from an input file.

#####Stream:

 - input: N/A,
 - output: a stream of file chunks.

`.fromFile(input)`

#####Parameters:

 - `input`: the name of the input file.

#####Alias: `fromFile`

#####Example:
```
fromFile('input.csv').pipe (...);
```

####.toFile

Returns a writeStream stream to an output file.

#####Stream:

 - input: a stream of Strings,
 - output: N/A.

`.toFile(output)`

#####Parameter:

 - `output`: the name of the output file.

#####Alias: `toFile`

#####Example:
```
(...).pipe(toFile('output.json'));
```

###Object methods

####.toString

Stringifies the data (which can be either a single object or several).

#####Stream:

 - input: a stream of Objects or Arrays,
 - output: a stream of Strings.

#####Alias: `toString`

#####Example:
```
(...).pipe(toString()).pipe(...)
```

####.mapData

Applies a map function to the data. The function must `return` something.

#####Stream:

 - input: a stream of anything,
 - output: a stream of anything.

`.mapData(data, index)`

#####Parameters:

 - `data`: the data,
 - `index`: the index of the data.

#####Alias: `mapData`

#####Example:
```
(...)
.pipe(mapData(function (data, index) {
  data['age'] = parseInt(data['age']);
  return data;
}))
.pipe(...)
```

###CSV

A CSV toolkit. You can use it via `oddity.csv`;

Example:

```
var odd = require ('oddity');
var csv = odd.csv;
```


###Chunk methods

####.splitLines
Splits the lines of a CSV file.

##### Stream:

 - input: a stream of file chunks from a CSV file,
 - output: a stream of Strings.

`.splitLines([options])`

#####Options:

 - `separator`: a String that separates data on each line (defaults to `,`)

#####Example:
```
(...).pipe(csv.splitLines({separator: '\r\n'})).pipe(...)
```

###String methods

####.toArray
Splits a string into an array.

#####Stream:
 - input: a stream of Strings,
 - output: a stream of Arrays.

`.toArray([options])`

#####Options:

 - `start`: the index of the first data to work on (defaults to `0` (the first one)),
 - `end`: the index of the last data to work on (defaults to `null` (the last one)),
 - `separator`: a String that separates data on each line (defaults to `,`),
 - `quote`: a String that escapes data that contains a separator (defaults to `"`).

#####Example:
```
(...).pipe(csv.toArray()).pipe(...)
```

###Array methods

####.zipHeader
Merges a data Array with a header Array. By default, the header is the first Array that goes through the stream.

#####Stream:
 - input: a stream of Arrays,
 - output: a stream of Objects.

`.zipHeader([options])`

#####Options:

 - `start`: the index of the first data to work on (defaults to `0` (the first one)),
 - `end`: the index of the last data to work on (defaults to `null` (the last one)),
 - `headerIndex`: the index of the header Array (defaults to `0` (the first Array)); if the header is located among the data, the data is buffered to be correctly zipped later,
 - `header`: an Array of Strings that defines the header (defaults to the first Array or the Array at `headerIndex`).

#####Example:
```
(...).pipe(csv.zipHeader()).pipe(...)
```

####.rotateData
Rotates a list of lists.

#####Stream:
 - input: a stream of Arrays,
 - output: a stream of Arrays.

#####Explanation:
```
Before rotation:
----------------
[
  ['iso', 'name'],
  ['FI', 'Finland'],
  ['FR', 'France'],
  ['MA', 'Morocco'],
  ['ES', 'Spain']
]

/*
=> zipHeader()
=>
[
  {
    iso: 'FI',
    name: 'Finland',
  }, {
    iso: 'FR',
    name: 'France',
  }, {
    iso: 'MA',
    name: 'Morocco',
  }, {
    iso: 'ES',
    name: 'Spain',
  }
]
*/

After rotation:
---------------
[
  ['iso', 'BR', 'FI', 'FR','MA', 'ES', 'TW', ],
  ['name', 'Brazil', 'Finland', 'France', 'Morocco', 'Spain', 'Taiwan']
]

/*
=> zipHeader()
=>
[
  {
  FI: 'Finland',
  FR: 'France',
  MA: 'Morocco',
  ES: 'Spain'
}
*/
```

Example:
```
(...).pipe(csv.rotateData()).pipe(...)
```

###Lazy methods
####.autoLoad

Returns a set of transformations, from CSV to JSON. Use this if your CSV file is perfect. Each option is passed straight to the corresponding option in the transformations and defaults to their respective default value.

#####Parameters:
`.autoLoad(input, output, [options])`

 - `input`: the name of the input file,
 - `output`: the name of the output file.

#####Options:

 - `lineSeparator`: the separator of the lines in the CSV (defaults to `\n`),
 - `separator`: the separator of the data within each line (defaults to `,`),
 - `quote`: the quote of the data within each line (defaults to `"`),
 - `headerIndex`: the index of the header line (defaults to `0`),
 - `header`: the header (defaults to the first line or the line provided by `headerIndex`).

`autoLoad` is a wrapper around the following transformations:
```
 fromFile -> splitLines -> toArray -> zipHeader -> toString -> toFile
```

Example:
```
csv.autoLoad ('examples/colors.csv', 'output.json');
```
