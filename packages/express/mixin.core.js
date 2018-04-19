const { sync: { sequence } } = require('mixinable');

const { Mixin } = require('@untool/core');

const uri = require('./lib/uri');

class ExpressMixin extends Mixin {
  runServer(options) {
    const { config } = this;
    return require('./lib/run')(this.createServer(options), this, config);
  }
  runDevServer(options) {
    const { config } = this;
    return require('./lib/run')(this.createDevServer(options), this, config);
  }
  createServer(options) {
    const { config } = this;
    return require('./lib/serve')(options, this, config);
  }
  createDevServer(options) {
    const { config } = this;
    return require('./lib/develop')(options, this, config);
  }
  createRenderer(options) {
    const { config } = this;
    return require('./lib/static')(options, this, config);
  }
  render() {
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
  getAssetPath(filePath) {
    const { config: { assetPath } } = this;
    const { resolveRelative } = uri;
    return resolveRelative(assetPath, filePath);
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
  finalizeServer: sequence,
  inspectServer: sequence,
};

module.exports = ExpressMixin;
