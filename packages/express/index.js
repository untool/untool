module.exports = {
  get uri() {
    return require('./lib/uri');
  },
  runServer(mode, options = {}) {
    const core = require('@untool/core').bootstrap();
    core.handleArguments(options);
    return core.runServer(mode);
  },
  createServer(mode, options = {}) {
    const core = require('@untool/core').bootstrap();
    core.handleArguments(options);
    return core.createServer(mode);
  },
  createRenderer(options = {}) {
    const core = require('@untool/core').bootstrap();
    core.handleArguments(options);
    return core.createRenderer();
  },
  renderLocations(options = {}) {
    const core = require('@untool/core').bootstrap();
    core.handleArguments(options);
    return core.renderLocations();
  },
};
