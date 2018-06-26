const {
  sync: { sequence, pipe, override: overrideSync },
  async: { override: overrideAsync },
} = require('mixinable');

const { Mixin } = require('@untool/core');

const uri = require('./lib/uri');

class ExpressMixin extends Mixin {
  createServer(mode) {
    const create = require('./lib/serve');
    return create(mode, this);
  }
  runServer(mode) {
    const run = require('./lib/run');
    const app = this.createServer(mode);
    return run(app, this);
  }
  createRenderer() {
    const create = require('./lib/static');
    const app = this.createServer('static');
    return create(app);
  }
  createFilesMiddleware() {
    const express = require('express');
    const helmet = require('helmet');
    const mime = require('mime');
    const { buildDir } = this.config;
    return express.static(buildDir, {
      maxAge: '1y',
      setHeaders: (res, filePath) => {
        if (
          (res && res.locals && res.locals.noCache) ||
          mime.getType(filePath) === 'text/html'
        ) {
          helmet.noCache()(null, res, () => {});
        }
      },
      redirect: false,
    });
  }
  renderLocations() {
    const indexFile = require('directory-index');
    const render = this.createRenderer();
    const { basePath, locations } = this.config;
    const { resolveAbsolute, resolveRelative } = uri;
    return Promise.all(
      locations
        .map((location) => resolveAbsolute(basePath, location))
        .map((location) => render(location))
    ).then((responses) =>
      responses.reduce((result, response, index) => {
        const key = resolveRelative(basePath, indexFile(locations[index]));
        return { ...result, [key]: response };
      }, {})
    );
  }
  configureServer(app, middlewares, mode) {
    if (mode !== 'static') {
      const helmet = require('helmet');
      middlewares.initial.push(helmet());
      middlewares.files.push(this.createFilesMiddleware());
      middlewares.postfiles.push(helmet.noCache());
    }
    return app;
  }
  registerCommands(yargs) {
    const { name } = this.config;
    return yargs.command(
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
  configureServer: pipe,
  inspectServer: sequence,
  createServer: overrideSync,
  runServer: overrideSync,
  createRenderer: overrideSync,
  renderLocations: overrideAsync,
};

module.exports = ExpressMixin;
