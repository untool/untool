'use strict';

const requireFromString = require('require-from-string');
const EnhancedPromise = require('eprom');

const { BuildError } = require('../utils/errors');
const { createCompiler, createWatchCompiler } = require('../utils/compiler');

const getBuildPromise = (webpackConfig) => {
  return new Promise((resolve, reject) => {
    createCompiler(webpackConfig, ({ name, type, data }, compiler) => {
      const { outputFileSystem: fs } = compiler;
      switch (name) {
        case 'error':
          reject(type === 'buildError' ? new BuildError(data) : data);
          break;
        case 'success':
          fs.readFile(data, 'utf-8', (readError, fileContents) => {
            if (readError) return reject(readError);
            resolve(requireFromString(fileContents, data));
          });
          break;
      }
    });
  });
};

const getWatchPromise = (webpackConfig) => {
  let middleware = null;

  return new EnhancedPromise((resolve, reject, reset) => {
    createWatchCompiler(webpackConfig, ({ name, type, data }) => {
      switch (name) {
        case 'error':
          reject(type === 'buildError' ? new BuildError(data) : data);
          break;
        case 'watchRun':
          reset();
          break;
        case 'success':
          if (middleware) {
            process.emit('RELOAD');
          } else {
            middleware = require(data);
          }
          resolve(middleware);
          break;
      }
    });
  });
};

module.exports = function createRenderMiddleware(webpackConfig, watch) {
  const getPromise = watch ? getWatchPromise : getBuildPromise;
  const enhancedPromise = getPromise(
    webpackConfig || getBuildConfig(...buildConfigArgs)
  );
  return function renderMiddleware(req, res, next) {
    enhancedPromise
      .then((middleware) => middleware(req, res, next))
      .catch(next);
  };
};
