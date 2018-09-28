'use strict';

const { join } = require('path');

const webpack = require('webpack');
const MemoryFS = require('memory-fs');

const sourceMapSupport = require('source-map-support');
const requireFromString = require('require-from-string');

const { Resolvable } = require('../utils/resolvable');

module.exports = function createRenderMiddleware(webpackConfig, watch) {
  const resolvable = new Resolvable((resolve, reject, reset) => {
    const compiler = webpack(webpackConfig);
    const handleCompilation = (compileError, stats) => {
      if (compileError) {
        reject(compileError);
      } else if (stats.hasErrors()) {
        const { errors } = stats.toJson();
        const details = errors.map((error) =>
          error.replace(/\033?\[[0-9]{1,2}m/g, '')
        );
        reject(new Error(`Can't compile:\n${details.join('\n')}`));
      } else {
        const { path, filename } = webpackConfig.output;
        const filePath = join(path, filename);
        const { outputFileSystem: fs } = compiler;
        fs.readFile(filePath, 'utf8', (readError, fileContents) => {
          if (readError) return reject(readError);
          try {
            const middleware = requireFromString(fileContents, filePath);
            resolve(middleware.default);
          } catch (moduleError) {
            reject(moduleError);
          }
        });
      }
    };
    sourceMapSupport.install({ environment: 'node', hookRequire: true });
    compiler.outputFileSystem = new MemoryFS();
    if (watch) {
      compiler.hooks.watchRun.tap('RenderMiddleware', () => reset());
      compiler.watch(webpackConfig.watchOptions, handleCompilation);
    } else {
      compiler.run(handleCompilation);
    }
  });
  return function renderMiddleware(req, res, next) {
    resolvable.then((middleware) => middleware(req, res, next)).catch(next);
  };
};
