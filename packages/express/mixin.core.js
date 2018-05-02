const {
  sync: { sequence, override: overrideSync },
  async: { override: overrideAsync },
} = require('mixinable');

const { Mixin } = require('@untool/core');

const uri = require('./lib/uri');

class ExpressMixin extends Mixin {
  create(method) {
    const create = require(method === 'static'
      ? './lib/static'
      : './lib/serve');
    const { options, config, initializeServer, finalizeServer } = this;
    return create(method, options, config, initializeServer, finalizeServer);
  }
  run(method) {
    const run = require('./lib/run');
    const { config, inspectServer, logInfo, logError } = this;
    const app = this.create(method);
    return run(app, config, inspectServer, logInfo, logError);
  }
  runServer() {
    return this.run('serve');
  }
  runDevServer() {
    return this.run('develop');
  }
  createServer() {
    return this.create('serve');
  }
  createDevServer() {
    return this.create('develop');
  }
  createRenderer() {
    return this.create('static');
  }
  renderLocations() {
    const indexFile = require('directory-index');
    const render = this.createRenderer();
    const { basePath, locations } = this.config;
    const { resolveAbsolute, resolveRelative } = uri;
    return Promise.all(
      locations
        .map(location => resolveAbsolute(basePath, location))
        .map(location => render(location))
    ).then(responses =>
      responses.reduce((result, response, index) => {
        const key = resolveRelative(basePath, indexFile(locations[index]));
        return { ...result, [key]: response };
      }, {})
    );
  }
  initializeServer(app, mode) {
    const { compress } = this.config;
    if (mode === 'serve' && compress) {
      app.use(
        require('compression')(typeof compress !== 'boolean' ? compress : {})
      );
    }
  }
  registerCommands(yargs) {
    const { namespace } = this.config;
    return yargs.command({
      command: 'serve',
      describe: `Serve ${namespace}`,
      builder: {
        production: {
          alias: 'p',
          default: false,
          describe: 'Enable production mode',
          type: 'boolean',
        },
        static: {
          alias: 's',
          default: false,
          describe: 'Only serve static locations',
          type: 'boolean',
        },
        rewrite: {
          alias: 'r',
          default: true,
          describe: 'Rewrite to static locations',
          type: 'boolean',
        },
      },
      handler: () => this.runServer(),
    });
  }
  handleArguments(argv) {
    this.options = { ...this.options, ...argv };
  }
}

ExpressMixin.strategies = {
  initializeServer: sequence,
  finalizeServer: sequence,
  inspectServer: sequence,
  runServer: overrideSync,
  runDevServer: overrideSync,
  renderLocations: overrideAsync,
};

module.exports = ExpressMixin;
