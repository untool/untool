import { join } from 'path';
import EventEmitter from 'events';

import webpack from 'webpack';
import MemoryFS from 'memory-fs';

import sourceMapSupport from 'source-map-support';
import requireFromString from 'require-from-string';

const createTranspiler = (webpackConfig, watchOptions) => {
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
      const filePath = join(
        webpackConfig.output.path,
        webpackConfig.output.filename
      );
      compiler.outputFileSystem.readFile(filePath, (readError, fileContent) => {
        if (readError) {
          emitResult('error', readError);
        } else {
          try {
            const source = fileContent.toString();
            const result = requireFromString(source, filePath);
            emitResult('success', result, stats);
          } catch (moduleError) {
            emitResult('error', moduleError);
          }
        }
      });
    }
  };

  if (webpackConfig.devtool) {
    sourceMapSupport.install({ hookRequire: true });
  }

  if (watchOptions) {
    compiler.watch(watchOptions, handleCompilation);
  } else {
    compiler.run(handleCompilation);
  }

  process.nextTick(emitter.emit.bind(emitter, 'start'));

  return emitter;
};

export default (webpackConfig, watchOptions) => {
  const transpiler = createTranspiler(webpackConfig, watchOptions);

  let middleware, error;

  transpiler.on('start', () => {
    middleware = null;
    error = null;
  });

  transpiler.on('success', result => {
    middleware = result;
    error = null;
  });

  transpiler.on('error', result => {
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
    return new Promise(resolve => {
      transpiler.once('result', () => {
        resolve(getMiddlewarePromise());
      });
    });
  };

  return (req, res, next) => {
    getMiddlewarePromise()
      .then(function(middleware) {
        middleware(req, res, next);
      })
      .catch(next);
  };
};
