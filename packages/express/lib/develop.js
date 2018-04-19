const express = require('express');

const rewriteMiddleware = require('./rewrite');

module.exports = (options, config, initializeServer, finalizeServer) => {
  const app = express();
  initializeServer(app, 'develop');
  app.use(rewriteMiddleware(options, config));
  finalizeServer(app, 'develop');
  return app;
};
