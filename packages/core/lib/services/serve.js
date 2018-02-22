import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { format } from 'url';

import { createServer as createHTTPServer } from 'http';
import { createServer as createHTTPSServer } from 'https';

import express from 'express';
import mime from 'mime';
import helmet from 'helmet';

import config from '../config';
import core from '../core';

import assetsMiddleware from './middleware/assets';
import rewriteMiddleware from './middleware/rewrite';

export const createServer = options => {
  const app = express();
  app.use((req, res, next) => {
    if (new RegExp(`/${config.serverFile}(?:\\?|$)`).test(req.url)) {
      next(`attempted to access ${req.url}`);
    }
    next();
  });
  core.initializeServer(app, 'serve');
  app.use(rewriteMiddleware(options));
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
  if (!options.static) {
    const middewarePath = join(config.buildDir, config.serverFile);
    if (existsSync(middewarePath)) {
      app.use(helmet.noCache());
      app.use(assetsMiddleware());
      app.use(require(middewarePath));
    }
  }
  core.finalizeServer(app, 'serve');
  return app;
};

export const runServer = app => {
  let server;
  if (config.https) {
    server = createHTTPSServer(
      {
        key: readFileSync(
          config.https.keyFile || join(__dirname, 'ssl', 'localhost.key')
        ),
        cert: readFileSync(
          config.https.certFile || join(__dirname, 'ssl', 'localhost.cert')
        ),
      },
      app
    );
  } else {
    server = createHTTPServer(app);
  }
  server.listen(config.port, config.host, error => {
    if (error) {
      core.logError(error);
    } else {
      core.logInfo(
        'server listening at ' +
          format({
            protocol: config.https ? 'https' : 'http',
            hostname: config.host === '0.0.0.0' ? 'localhost' : config.host,
            port: config.port,
            pathname: config.basePath,
          })
      );
    }
  });
};

export default (...args) => runServer(createServer(...args));
