const { sync: { sequence } } = require('mixinable');

const { Mixin } = require('@untool/core');

const uri = require('./lib/uri');

class ExpressMixin extends Mixin {
  runServer(options) {
    const { core, config } = this;
    return require('./lib/run')(this.createServer(options), core, config);
  }
  runDevServer(options) {
    const { core, config } = this;
    return require('./lib/run')(this.createDevServer(options), core, config);
  }
  createServer(options) {
    const { core, config } = this;
    return require('./lib/serve')(options, core, config);
  }
  createDevServer(options) {
    const { core, config } = this;
    return require('./lib/develop')(options, core, config);
  }
  createRenderer(options) {
    const { core, config } = this;
    return require('./lib/static')(options, core, config);
  }
  render() {
    const indexFile = require('directory-index');
    const render = this.createRenderer();
    const { basePath, locations } = this.config;
    const { resolveAbsolute, resolveRelative } = uri;
    return Promise.resolve().then(() => {
      return Promise.all(
        locations
          .map(location => resolveAbsolute(basePath, location))
          .map(location => render(location))
      ).then(responses =>
        responses.reduce((result, response, i) => {
          const key = resolveRelative(basePath, indexFile(locations[i]));
          return { ...result, [key]: response };
        }, {})
      );
    });
  }
  getAssetPath(filePath) {
    const { config: { assetPath } } = this;
    const { resolveRelative } = uri;
    return resolveRelative(assetPath, filePath);
  }
  registerCommands(yargs) {
    const { namespace } = this.config;
    return yargs.command({
      command: 'serve',
      describe: `Serve ${namespace}`,
      builder: {
        production: {
          alias: 'p',
          default: true,
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
      handler: argv => {
        this.runServer(argv);
      },
    });
  }
}

ExpressMixin.strategies = {
  initializeServer: sequence,
  optimizeServer: sequence,
  finalizeServer: sequence,
  inspectServer: sequence,
};

module.exports = ExpressMixin;
