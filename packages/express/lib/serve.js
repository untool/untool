const { existsSync } = require('fs');
const { join } = require('path');

const express = require('express');
const helmet = require('helmet');
const mime = require('mime');

const rewriteMiddleware = require('./rewrite');

module.exports = (options, core, config) => {
  const app = express();
  app.use((req, res, next) => {
    if (new RegExp(`/${config.serverFile}(?:\\?|$)`).test(req.url)) {
      next(`attempted to access ${req.url}`);
    }
    next();
  });
  core.initializeServer(app, 'serve');
  app.use(rewriteMiddleware(options, config));
  app.use(helmet());
  app.use(
    express.static(config.buildDir, {
      maxAge: '1y',
      setHeaders: function(res, filePath) {
        if (res.locals.noCache || mime.getType(filePath) === 'text/html') {
          helmet.noCache()(null, res, function() {});
        }
      },
      redirect: false,
    })
  );
  core.optimizeServer(app, 'serve');
  if (!options.static) {
    const middewarePath = join(config.buildDir, config.serverFile);
    if (existsSync(middewarePath)) {
      app.use(helmet.noCache());
      app.use(require(middewarePath));
    }
  }
  core.finalizeServer(app, 'serve');
  return app;
};
