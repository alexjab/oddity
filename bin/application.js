#!/usr/bin/env node

var consolation = require ('consolation');
var console = new consolation ({title: 'oddity', use_symbols: false, use_time: false});

var err, filename;

try {
  if (process.argv.length > 2) {
    filename = process.argv[process.argv.length - 1];
  } else {
    filename = 'Oddfile.js';
  }
  require (filename);
} catch (e) {
  err = e;
  console.err ('An error happened.');
  console.err (e.toString ());
}

