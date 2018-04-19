const { sync: { sequence } } = require('mixinable');

const { Mixin } = require('@untool/core');

const uri = require('./lib/uri');

class ExpressMixin extends Mixin {
  create(method, options) {
    const create = require(`./lib/${method}`);
    const { config, initializeServer, finalizeServer } = this;
    return create(options, config, initializeServer, finalizeServer);
  }
  run(method, options) {
    const run = require('./lib/run');
    const { config, inspectServer, logInfo, logError } = this;
    const app = this.create(method, options);
    return run(app, config, inspectServer, logInfo, logError);
  }
  runServer(options) {
    return this.run('serve', options);
  }
  runDevServer(options) {
    return this.run('develop', options);
  }
  createServer(options) {
    return this.create('serve', options);
  }
  createDevServer(options) {
    return this.create('develop', options);
  }
  createRenderer(options) {
    return this.create('static', options);
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
