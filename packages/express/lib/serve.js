const express = require('express');
const helmet = require('helmet');
const mime = require('mime');

module.exports = (method, options, config, initialize, optimize, finalize) => {
  const app = express();
  initialize(app, method);
  app.use(helmet());
  app.use(
    express.static(config.buildDir, {
      maxAge: '1y',
      setHeaders: function(res, filePath) {
        if (
          (res && res.locals && res.locals.noCache) ||
          mime.getType(filePath) === 'text/html'
        ) {
          helmet.noCache()(null, res, function() {});
        }
      },
      redirect: false,
    })
  );
  app.use(helmet.noCache());
  optimize(app, method);
  finalize(app, method);
  return app;
};
