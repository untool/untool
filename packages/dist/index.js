'use strict';

const { ...strategies } = require('mixinable');

const core = require('@untool/core');
const yargs = require('@untool/yargs');
const express = require('@untool/express');
const webpack = require('@untool/webpack');
const react = require('@untool/react');

const configure = (...args) => ({
  ...[yargs, express, webpack, react]
    .map(({ configure }) => configure(...args))
    .reduce(
      (result, exports) => ({
        ...result,
        ...exports,
        internal: { ...result.internal, ...exports.internal },
      }),
      { ...core }
    ),
  strategies,
  configure,
});

module.exports = configure();
