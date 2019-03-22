'use strict';

const { join } = require('path');

const webpack = require('webpack');
const MemoryFS = require('memory-fs');

const sourceMapSupport = require('source-map-support');
const requireFromString = require('require-from-string');

const EnhancedPromise = require('eprom');

const { BuildError } = require('../utils/errors');

const getMiddlewarePromise = (webpackConfig, watch) => {
  const compiler = webpack(webpackConfig);
  compiler.outputFileSystem = new MemoryFS();
  sourceMapSupport.install({ environment: 'node', hookRequire: true });
  return new EnhancedPromise((resolve, reject, reset) => {
    const handler = (compileError, stats) => {
      if (compileError) {
        reject(compileError);
      } else if (stats.hasErrors()) {
        reject(new BuildError(stats.toJson().errors.shift()));
      } else {
        const { path, filename } = webpackConfig.output;
        const filePath = join(path, filename);
        const { outputFileSystem: fs } = compiler;
        fs.readFile(filePath, 'utf-8', (readError, fileContents) => {
          if (readError) return reject(readError);
          resolve(requireFromString(fileContents, filePath));
        });
      }
    };
    if (watch) {
      compiler.hooks.watchRun.tap('RenderMiddleware', () => reset());
      compiler.watch(webpackConfig.watchOptions, handler);
    } else {
      compiler.run(handler);
    }
  });
};

module.exports = function createRenderMiddleware(webpackConfig, watch) {
  const middlewarePromise = getMiddlewarePromise(webpackConfig, watch);
  return function renderMiddleware(req, res, next) {
    middlewarePromise
      .then((middleware) => middleware(req, res, next))
      .catch(next);
  };
};
