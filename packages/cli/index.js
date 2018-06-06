#!/usr/bin/env node
'use strict';

const { dirname } = require('path');

const { sync: findUp } = require('find-up');
const { sync: resolve } = require('enhanced-resolve');

try {
  const pkgFile = findUp('package.json');
  const yargsPath = resolve(dirname(pkgFile), '@untool/yargs');
  require(yargsPath).run();
} catch (_) {
  // eslint-disable-next-line no-console
  console.error("Error: Can't find @untool/yargs \n");
  process.exit(1);
}
