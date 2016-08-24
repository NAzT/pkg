#!/usr/bin/env node

'use strict';

if (process) return; // TODO ENABLE

let fs = require('fs');
let assert = require('assert');
let utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

let target = process.argv[2];
let input = './test-x-index.js';
let output = './test-output.exe';
let standard = 'stdout';

let left, right;

left = fs.readFileSync(
  input, 'utf8'
).split('\n').filter(function (line) {
  return line.indexOf('/**/') >= 0;
}).map(function (line) {
  return line.split('/**/')[1];
}).join('\n') + '\n';

let inspect = (standard === 'stdout')
  ? [ 'inherit', 'pipe', 'inherit' ]
  : [ 'inherit', 'inherit', 'pipe' ];

let c = utils.pkg.sync([
  '--target', target,
  '--loglevel', 'info',
  '--output', output, input
], inspect);

right = c[standard].toString();
assert(right.indexOf('\x1B\x5B') < 0, 'colors detected');

let rightLines = [];
right.split('\n').some(function (line) {
  let s = line.split('Cannot resolve \'')[1];
  if (s) {
    rightLines.push(s.split('\'')[0]);
    return;
  }
  s = line.split('Path.resolve(')[1];
  if (s) {
    rightLines.push(s.split(')')[0]);
    return;
  }
});

right = rightLines.join('\n') + '\n';
assert.equal(left, right);
utils.vacuum.sync(output);
