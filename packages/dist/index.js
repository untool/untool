'use strict';

const core = require('@untool/core');
const express = require('@untool/express');
const react = require('@untool/react');
const webpack = require('@untool/webpack');
const yargs = require('@untool/yargs');

const configure = (config, options) => ({
  ...[express, react, webpack, yargs]
    .map((module) => module.configure(config, options))
    .reduce(
      (result, module) => ({
        ...result,
        ...module,
        internal: { ...result.internal, ...module.internal },
      }),
      { ...core }
    ),
  configure,
});

module.exports = configure();
