'use strict';

const { join } = require('path');

const webpack = require('webpack');

const { Resolvable } = require('../utils/resolvable');

module.exports = function createRenderMiddleware(webpackConfig) {
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
        try {
          delete require.cache[require.resolve(filePath)];
          resolve(require(filePath));
        } catch (requireError) {
          reject(requireError);
        }
      }
    };
    if (webpackConfig.watchOptions) {
      compiler.hooks.watchRun.tap('untool-transpiler', () => reset());
      compiler.watch(webpackConfig.watchOptions, handleCompilation);
    } else {
      compiler.run(handleCompilation);
    }
  });
  return function webpackRenderMiddleware(req, res, next) {
    resolvable.then((middleware) => middleware(req, res, next)).catch(next);
  };
};
