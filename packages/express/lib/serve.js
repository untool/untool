const express = require('express');
const helmet = require('helmet');
const mime = require('mime');

const rewriteMiddleware = require('./rewrite');

module.exports = (options, config, initializeServer, finalizeServer) => {
  const app = express();
  initializeServer(app, 'serve');
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
  app.use(helmet.noCache());
  finalizeServer(app, 'serve');
  return app;
};
