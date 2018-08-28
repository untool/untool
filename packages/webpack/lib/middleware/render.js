'use strict';

const { join } = require('path');

const webpack = require('webpack');
const MemoryFS = require('memory-fs');

const sourceMapSupport = require('source-map-support');
const requireFromString = require('require-from-string');

const { Resolvable } = require('../utils/resolvable');

module.exports = exports = function createRenderMiddleware(webpackConfig) {
  const resolvable = new Resolvable();
  const compiler = Object.assign(webpack(webpackConfig), {
    outputFileSystem: new MemoryFS(),
  });
  const handleCompilation = (compileError, stats) => {
    if (compileError) {
      resolvable.reject(compileError);
    } else if (stats.hasErrors() || stats.hasWarnings()) {
      const { errors, warnings } = stats.toJson();
      resolvable.reject(
        new Error(`Can't compile:\n${[...errors, ...warnings].join('\n')}`)
      );
    } else {
      const { path, filename } = webpackConfig.output;
      const filePath = join(path, filename);
      compiler.outputFileSystem.readFile(filePath, (readError, fileContent) => {
        if (readError) {
          resolvable.reject(readError);
        } else {
          try {
            resolvable.resolve(
              requireFromString(fileContent.toString(), filePath)
            );
          } catch (moduleError) {
            resolvable.reject(moduleError);
          }
        }
      });
    }
  };
  if (webpackConfig.devtool) {
    sourceMapSupport.install({
      environment: 'node',
      hookRequire: process.env.NODE_ENV !== 'production',
    });
  }
  if (webpackConfig.watchOptions) {
    compiler.hooks.watchRun.tap('untool-transpiler', resolvable.reset);
    compiler.watch(webpackConfig.watchOptions, handleCompilation);
  } else {
    compiler.run(handleCompilation);
  }
  return function webpackRenderMiddleware(req, res, next) {
    resolvable.then((middleware) => middleware(req, res, next)).catch(next);
  };
};
