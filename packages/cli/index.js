#!/usr/bin/env node
'use strict';

const { promisify } = require('util');
const { dirname } = require('path');

const findUp = require('find-up');
const resolve = promisify(require('enhanced-resolve'));

findUp('package.json')
  .then(pkgFile =>
    resolve(dirname(pkgFile), '@untool/yargs').then(path => require(path).run())
  )
  .catch(error => {
    // eslint-disable-next-line no-console
    console.error(error.stack ? error.stack.toString() : error.toString());
    process.exit(1);
  });
