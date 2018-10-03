'use strict';

const {
  sync: { sequence, callable },
} = require('mixinable');

const { Mixin } = require('@untool/core');

class ExpressMixin extends Mixin {
  runServer(mode) {
    const run = require('./lib/run');
    const app = this.createServer(mode);
    return run(app, this);
  }
  createServer(mode) {
    const create = require('./lib/serve');
    return create(mode, this);
  }
  createRenderer() {
    const create = require('./lib/render');
    const app = this.createServer('static');
    return create(app);
  }
  configureServer(app, middlewares, mode) {
    if (mode !== 'static') {
      const helmet = require('helmet');
      const express = require('express');
      const mime = require('mime');
      const { distDir } = this.config;
      middlewares.initial.push(helmet());
      middlewares.files.push(
        express.static(distDir, {
          maxAge: '1y',
          setHeaders: (res, filePath) => {
            const { noCache } = res.locals || {};
            if (noCache || mime.getType(filePath) === 'text/html') {
              helmet.noCache()(null, res, () => {});
            }
          },
          redirect: false,
        })
      );
      middlewares.postfiles.push(helmet.noCache());
    }
  }
  registerCommands(yargs) {
    const { name } = this.config;
    yargs.command(
      this.configureCommand({
        command: 'serve',
        describe: `Serve ${name}`,
        builder: {
          production: {
            alias: 'p',
            default: false,
            describe: 'Enable production mode',
            type: 'boolean',
          },
        },
        handler: () => this.runServer('serve'),
      })
    );
  }
  handleArguments(argv) {
    this.options = { ...this.options, ...argv };
  }
}

ExpressMixin.strategies = {
  configureServer: sequence,
  inspectServer: sequence,
  runServer: callable,
  createServer: callable,
  createRenderer: callable,
};

module.exports = ExpressMixin;
