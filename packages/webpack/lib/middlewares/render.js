'use strict';

const requireFromString = require('require-from-string');
const EnhancedPromise = require('eprom');
const { initialize } = require('@untool/core');

const { BuildError } = require('../utils/errors');
const {
  createCompiler,
  createWatchCompiler,
  forkWatchCompiler,
} = require('../utils/compiler');

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

const getWatchPromise = (
  webpackConfig,
  getBuildConfig,
  buildConfigArgs,
  extra
) => {
  let middleware = null;
  const createCompiler = extra
    ? forkWatchCompiler.bind(null, __filename, buildConfigArgs, extra)
    : createWatchCompiler.bind(null, webpackConfig);

  return new EnhancedPromise((resolve, reject, reset) => {
    createCompiler(({ name, type, data }) => {
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

process.on('message', (message) => {
  if (message.name === 'start') {
    const { overrides, options, buildConfigArgs } = message;
    const mixin = initialize(overrides, { isChildProcess: true });
    mixin.bootstrap().then(() => {
      mixin.handleArguments(options);
    });
    const webpackConfig = mixin.getBuildConfig(...buildConfigArgs);
    try {
      createWatchCompiler(webpackConfig, process.send.bind(process));
    } catch (error) {
      process.send({
        name: 'error',
        data: error.message,
      });
    }
  }
});

module.exports = function createRenderMiddleware(
  webpackConfig,
  watch,
  getBuildConfig,
  buildConfigArgs,
  extra
) {
  const getPromise = watch ? getWatchPromise : getBuildPromise;
  const enhancedPromise = getPromise(
    webpackConfig || getBuildConfig(...buildConfigArgs),
    getBuildConfig,
    buildConfigArgs,
    extra
  );
  return function renderMiddleware(req, res, next) {
    enhancedPromise
      .then((middleware) => middleware(req, res, next))
      .catch(next);
  };
};
