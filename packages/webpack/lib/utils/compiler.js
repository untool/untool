'use strict';

const { join } = require('path');
const webpack = require('webpack');
const MemoryFS = require('memory-fs');
const sourceMapSupport = require('source-map-support');

function compilerHandler(config, callback, compileError, stats) {
  if (compileError) {
    callback({
      name: 'error',
      type: 'compileError',
      data: compileError,
    });
  } else if (stats.hasErrors()) {
    callback({
      name: 'error',
      type: 'buildError',
      data: stats.toJson({ all: false, errors: true }).errors.shift(),
    });
  } else {
    const { path, filename } = config.output;
    callback({
      name: 'success',
      data: join(path, filename),
    });
  }
}

function createCompiler(webpackConfig, callback) {
  const compiler = webpack(webpackConfig);
  compiler.outputFileSystem = new MemoryFS();
  sourceMapSupport.install({ environment: 'node', hookRequire: true });
  compiler.run(
    compilerHandler.bind(null, webpackConfig, (message) => {
      callback(message, compiler);
    })
  );
}
exports.createCompiler = createCompiler;

function createWatchCompiler(webpackConfig, callback) {
  const compiler = webpack(webpackConfig);
  compiler.hooks.watchRun.tap('RenderMiddleware', () =>
    callback({ name: 'watchRun' })
  );
  compiler.watch(
    webpackConfig.watchOptions,
    compilerHandler.bind(null, webpackConfig, callback)
  );
}
exports.createWatchCompiler = createWatchCompiler;
