module.exports = {
  clean(options = {}) {
    const core = require('@untool/core').bootstrap();
    core.handleArguments(options);
    return core.clean();
  },
  build(options = {}) {
    const core = require('@untool/core').bootstrap();
    core.handleArguments(options);
    return core.build();
  },
};
