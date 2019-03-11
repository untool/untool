'use strict';

const prettyMS = require('pretty-ms');
const isPlainObject = require('is-plain-object');

const {
  sync: { sequence, callable },
} = require('mixinable');

const {
  Mixin,
  internal: { validate, invariant },
} = require('@untool/core');

class ExpressMixin extends Mixin {
  runServer(mode) {
    const run = require('../lib/run');
    const app = this.createServer(mode);
    return run(app, this);
  }
  createServer(mode) {
    const create = require('../lib/serve');
    return create(mode, this);
  }
  createRenderer() {
    const create = require('../lib/render');
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
      if (typeof this.getLogger === 'function') {
        const loggerMiddleware = require('../lib/log');
        app.use(loggerMiddleware(this.getLogger()));
      }
    }
  }
  inspectServer(server) {
    if (typeof this.getLogger === 'function') {
      const logger = this.getLogger();
      server.on('startup', (address) => {
        const { basePath = '' } = this.config;
        logger.info(`listening at ${address}/${basePath}`);
      });
      server.on('shutdown', () => {
        const { gracePeriod } = this.config;
        const timeout = prettyMS(gracePeriod);
        logger.warn(`shutting down in ${timeout}`);
      });
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
  configureServer: validate(sequence, ([app, middlewares, mode]) => {
    invariant(
      app && app.handle && app.route,
      'configureServer(): Received invalid Express app'
    );
    invariant(
      isPlainObject(middlewares) && Object.keys(middlewares).length >= 16,
      'configureServer(): Received invalid middlewares object'
    );
    invariant(
      typeof mode === 'string',
      'configureServer(): Received invalid mode string'
    );
  }),
  inspectServer: validate(sequence, ([server]) => {
    invariant(
      server && typeof server.listen === 'function',
      'inspectServer(): Received invalid HTTP server instance'
    );
  }),
  runServer: validate(callable, ([mode]) => {
    invariant(
      typeof mode === 'string',
      'runServer(): Received invalid mode string'
    );
  }),
  createServer: validate(
    callable,
    ([mode]) => {
      invariant(
        typeof mode === 'string',
        'createServer(): Received invalid mode string'
      );
    },
    (result) => {
      invariant(
        result && result.handle && result.route,
        'createServer(): Returned invalid Express app'
      );
    }
  ),
  createRenderer: validate(
    callable,
    ({ length }) => {
      invariant(
        length === 0,
        'createRenderer(): Received unexpected argument(s)'
      );
    },
    (result) => {
      invariant(
        typeof result === 'function',
        'createRenderer(): Returned invalid renderer function'
      );
    }
  ),
};

module.exports = ExpressMixin;
