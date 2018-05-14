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
    const { options, config, initializeServer, finalizeServer } = this;
    return create(mode, options, config, initializeServer, finalizeServer);
  }
  runServer(mode) {
    const run = require('./lib/run');
    const app = typeof mode === 'string' ? this.createServer(mode) : mode;
    const { config, inspectServer, logInfo, logError } = this;
    return run(app, config, inspectServer, logInfo, logError);
  }
  renderLocations() {
    const indexFile = require('directory-index');
    const render = this.createServer('static');
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
      handler: () => this.runServer('serve'),
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
  createServer: overrideSync,
  runServer: overrideSync,
  renderLocations: overrideAsync,
};

module.exports = ExpressMixin;
