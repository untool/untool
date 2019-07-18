'use strict';

const { fork } = require('child_process');
const { join } = require('path');

const webpack = require('webpack');
const serializeError = require('serialize-error');

const EnhancedPromise = require('eprom');

const { configure } = require('../../');
const { BuildError, CompilerError } = require('../utils/errors');

function createCompiler({ target, watch }, options, overrides) {
  const child = fork(__filename, [], {
    env: {
      ...process.env,
      IS_UNTOOL_CHILD_PROCESS_COMPILER: 'true',
    },
  });
  process.on('exit', () => child.kill());
  child.send({
    name: watch ? 'watch' : 'compile',
    target,
    overrides,
    options,
  });
  return new EnhancedPromise((resolve, reject, reset) => {
    child.on('message', (message) => {
      const { type, data, reason } = message;
      if (type === 'reject') {
        reject(
          typeof reason === 'string'
            ? new BuildError(reason)
            : new CompilerError(reason)
        );
      } else if (type === 'reset') {
        reset();
      } else if (type === 'resolve') {
        resolve(require(data));
        if (!watch) {
          child.kill();
        } else {
          process.emit('RELOAD');
        }
      }
      process.emit('debug-child-message', message);
    });
  });
}
exports.createCompiler = createCompiler;

process.on('message', (message) => {
  if (message.name !== 'watch' && message.name !== 'compile') return;
  const { target, overrides, options } = message;
  const webpackConfig = configure(overrides, options).getBuildConfig(
    target,
    message.name === 'watch'
  );
  try {
    const compiler = webpack(webpackConfig);
    compiler.hooks.watchRun.tap('RenderMiddleware', () =>
      process.send({ type: 'reset' })
    );
    const compile =
      message.name === 'watch'
        ? compiler.watch.bind(compiler, webpackConfig.watchOptions)
        : compiler.run.bind(compiler);

    compile((compileError, stats) => {
      if (compileError) {
        process.send({
          type: 'reject',
          reason: new CompilerError(compileError),
        });
      } else if (stats.hasErrors()) {
        process.send({
          type: 'reject',
          reason: new BuildError(
            stats.toJson({ all: false, errors: true }).errors.shift()
          ),
        });
      } else {
        const { path, filename } = webpackConfig.output;
        const filepath = join(path, filename);
        process.send({ type: 'resolve', data: filepath });
      }
    });
  } catch (error) {
    process.send({
      type: 'reject',
      reason: serializeError(error),
    });
  }
});
