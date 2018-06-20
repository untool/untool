const {
  sync: { sequence, override: overrideSync },
  async: { override: overrideAsync },
} = require('mixinable');

const { Mixin } = require('@untool/core');

const uri = require('./lib/uri');

class ExpressMixin extends Mixin {
  createServer(mode) {
    const isStatic = mode === 'static';
    const create = isStatic ? require('./lib/static') : require('./lib/serve');
    return create(
      mode,
      this.options,
      this.config,
      this.initializeServer,
      this.optimizeServer,
      this.finalizeServer
    );
  }
  runServer(mode) {
    const run = require('./lib/run');
    const app = this.createServer(mode);
    const { config, inspectServer, handleError } = this;
    return run(app, config, inspectServer, handleError);
  }
  renderLocations() {
    const indexFile = require('directory-index');
    const render = this.createServer('static');
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
  registerCommands(yargs) {
    const { name } = this.config;
    return yargs.command({
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
    });
  }
  handleArguments(argv) {
    this.options = { ...this.options, ...argv };
  }
}

ExpressMixin.strategies = {
  initializeServer: sequence,
  optimizeServer: sequence,
  finalizeServer: overrideSync,
  inspectServer: sequence,
  createServer: overrideSync,
  runServer: overrideSync,
  renderLocations: overrideAsync,
};

module.exports = ExpressMixin;
