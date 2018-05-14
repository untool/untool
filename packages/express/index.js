module.exports = {
  get uri() {
    return require('./lib/uri');
  },
  createServer(mode, options = {}) {
    const core = require('@untool/core').bootstrap();
    core.handleArguments(options);
    return core.createServer(mode);
  },
  runServer(mode, options = {}) {
    const core = require('@untool/core').bootstrap();
    core.handleArguments(options);
    return core.runServer(mode);
  },
  renderLocations(options = {}) {
    const core = require('@untool/core').bootstrap();
    core.handleArguments(options);
    return core.renderLocations();
  },
};
