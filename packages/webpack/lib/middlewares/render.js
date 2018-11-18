'use strict';

const { join } = require('path');

const webpack = require('webpack');
const MemoryFS = require('memory-fs');

const sourceMapSupport = require('source-map-support');
const requireFromString = require('require-from-string');

const EnhancedPromise = require('eprom');

const extractErrors = (stats) => {
  const { errors } = stats.toJson();
  const details = errors.map((error) =>
    error.replace(/\033?\[[0-9]{1,2}m/g, '')
  );
  return details.join('\n');
};

const getBuildPromise = (webpackConfig) => {
  const compiler = webpack(webpackConfig);
  compiler.outputFileSystem = new MemoryFS();
  sourceMapSupport.install({ environment: 'node', hookRequire: true });
  return new Promise((resolve, reject) => {
    compiler.run((compileError, stats) => {
      if (compileError) {
        reject(compileError);
      } else if (stats.hasErrors()) {
        reject(new Error(`Can't compile:\n${extractErrors(stats)}`));
      } else {
        const { path, filename } = webpackConfig.output;
        const filePath = join(path, filename);
        const { outputFileSystem: fs } = compiler;
        fs.readFile(filePath, 'utf-8', (readError, fileContents) => {
          if (readError) return reject(readError);
          resolve(requireFromString(fileContents, filePath));
        });
      }
    });
  });
};

const getWatchPromise = (webpackConfig) => {
  const compiler = webpack(webpackConfig);
  let middleware = null;
  return new EnhancedPromise((resolve, reject, reset) => {
    compiler.hooks.watchRun.tap('RenderMiddleware', () => reset());
    compiler.watch(webpackConfig.watchOptions, (compileError, stats) => {
      if (compileError) {
        reject(compileError);
      } else if (stats.hasErrors()) {
        reject(new Error(`Can't compile:\n${extractErrors(stats)}`));
      } else {
        if (middleware) {
          process.kill(process.pid, 'SIGUSR2');
        } else {
          const { path, filename } = webpackConfig.output;
          const filePath = join(path, filename);
          middleware = require(filePath);
        }
        resolve(middleware);
      }
    });
  });
};

module.exports = function createRenderMiddleware(webpackConfig, watch) {
  const getPromise = watch ? getWatchPromise : getBuildPromise;
  const enhancedPromise = getPromise(webpackConfig);
  return function renderMiddleware(req, res, next) {
    enhancedPromise
      .then((middleware) => middleware(req, res, next))
      .catch(next);
  };
};
