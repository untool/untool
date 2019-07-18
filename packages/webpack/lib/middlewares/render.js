'use strict';

const { join } = require('path');
const { existsSync: exists } = require('fs');
const { createCompiler } = require('../utils/compiler');

module.exports = (build, watch, { options, config }) => {
  const { _overrides: overrides, serverDir, serverFile } = config;
  const serverFilePath = join(serverDir, serverFile);
  let enhancedPromise;
  if (build) {
    enhancedPromise = createCompiler(
      { target: 'server', watch },
      options,
      overrides
    );
  } else if (exists(serverFilePath)) {
    enhancedPromise = Promise.resolve(require(serverFilePath));
  } else {
    enhancedPromise = Promise.resolve((req, res, next) => next());
  }
  return function renderMiddleware(req, res, next) {
    enhancedPromise
      .then((middleware) => middleware(req, res, next))
      .catch(next);
  };
};
