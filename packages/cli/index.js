#!/usr/bin/env node
'use strict';

const dirname = require('path').dirname;

const findUp = require('find-up').sync;
const resolve = require('enhanced-resolve').sync;

const pkgPath = findUp('package.json');

if (!pkgPath) {
  // eslint-disable-next-line no-console
  console.error(
    'Unable to locate package.json. I this a project folder?\n%s',
    process.cwd()
  );
  process.exit(1);
}

try {
  const corePath = resolve(dirname(pkgPath), '@untool/core');
  try {
    require(corePath).initialize();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      'Unable to initialize @untool/core:\n%s',
      error.stack ? error.stack.toString() : error.toString()
    );
    process.exit(1);
  }
} catch (_) {
  // eslint-disable-next-line no-console
  console.error(
    'Unable to locate @untool/core. Have you installed it in this folder?\n%s',
    process.cwd()
  );
  process.exit(1);
}
