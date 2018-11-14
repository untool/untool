'use strict';

const { join } = require('path');

const webpack = require('webpack');
const MemoryFS = require('memory-fs');
const sourceMapSupport = require('source-map-support');
const requireFromString = require('require-from-string');
const EnhancedPromise = require('eprom');

module.exports = function createRenderMiddleware(webpackConfig, watch) {
  sourceMapSupport.install({ environment: 'node', hookRequire: true });

  let middleware = null;

  const enhancedPromise = new EnhancedPromise((resolve, reject, reset) => {
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
        if (watch) {
          if (middleware) {
            process.kill(process.pid, 'SIGUSR2');
            resolve(middleware);
          } else {
            try {
              middleware = require(filePath).default;
              resolve(middleware);
            } catch (moduleError) {
              reject(moduleError);
            }
          }
        } else {
          const { outputFileSystem: fs } = compiler;
          fs.readFile(filePath, 'utf-8', (readError, fileContents) => {
            if (readError) return reject(readError);
            resolve(requireFromString(fileContents, filePath).default);
          });
        }
      }
    };

    const compiler = webpack(webpackConfig);

    if (watch) {
      compiler.hooks.watchRun.tap('RenderMiddleware', () => reset());
      compiler.watch(webpackConfig.watchOptions, handleCompilation);
    } else {
      compiler.outputFileSystem = new MemoryFS();
      compiler.run(handleCompilation);
    }
  });

  return function renderMiddleware(req, res, next) {
    enhancedPromise
      .then((middleware) => middleware(req, res, next))
      .catch(next);
  };
};
