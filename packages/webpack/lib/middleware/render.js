const { join } = require('path');
const EventEmitter = require('events');

const webpack = require('webpack');
const MemoryFS = require('memory-fs');

const sourceMapSupport = require('source-map-support');
const requireFromString = require('require-from-string');

module.exports = exports = function createRenderMiddleware(webpackConfig) {
  const transpiler = exports.createTranspiler(webpackConfig);
  let middleware, error;
  transpiler.on('start', () => {
    middleware = null;
    error = null;
  });
  transpiler.on('success', (result) => {
    middleware = result;
    error = null;
  });
  transpiler.on('error', (result) => {
    middleware = null;
    error = result;
  });
  const getMiddlewarePromise = () => {
    if (error) {
      return Promise.reject(error);
    }
    if (middleware) {
      return Promise.resolve(middleware);
    }
    return new Promise((resolve) => {
      transpiler.once('result', () => {
        resolve(getMiddlewarePromise());
      });
    });
  };
  return (req, res, next) => {
    getMiddlewarePromise()
      .then((middleware) => middleware(req, res, next))
      .catch(next);
  };
};

exports.createTranspiler = function createTranspiler(webpackConfig) {
  const emitter = new EventEmitter();
  const compiler = webpack(webpackConfig);
  compiler.outputFileSystem = new MemoryFS();
  compiler.hooks.watchRun.tap('untool-transpiler', () => emitter.emit('start'));
  const emitResult = (...args) => {
    emitter.emit(...args);
    emitter.emit('result');
  };
  const handleCompilation = (compileError, stats) => {
    if (compileError) {
      emitResult('error', compileError);
    } else if (stats.hasErrors()) {
      stats.toJson().errors.forEach(emitResult.bind(null, 'error'));
    } else if (stats.hasWarnings()) {
      stats.toJson().warnings.forEach(emitResult.bind(null, 'error'));
    } else {
      const { path, filename } = webpackConfig.output;
      const filePath = join(path, filename);
      compiler.outputFileSystem.readFile(filePath, (readError, fileContent) => {
        if (readError) {
          emitResult('error', readError);
        } else {
          try {
            const result = requireFromString(fileContent.toString(), filePath);
            emitResult('success', result, stats);
          } catch (moduleError) {
            emitResult('error', moduleError);
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
    compiler.watch(webpackConfig.watchOptions, handleCompilation);
  } else {
    compiler.run(handleCompilation);
  }
  process.nextTick(emitter.emit.bind(emitter, 'start'));
  return emitter;
};
