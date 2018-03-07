const express = require('express');

const rewriteMiddleware = require('./rewrite');

module.exports = (options, core, config) => {
  const app = express();
  core.initializeServer(app, 'develop');
  app.use(rewriteMiddleware(options, config));
  core.optimizeServer(app, 'develop');
  core.finalizeServer(app, 'develop');
  return app;
};
