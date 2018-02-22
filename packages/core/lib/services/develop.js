import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import config from '../config';
import core from '../core';

import { runServer } from './serve';
import assetsMiddleware from './middleware/assets';
import rewriteMiddleware from './middleware/rewrite';
import transpilerMiddleware from './middleware/transpiler';

export const createServer = options => {
  const { webpackBrowserConfig, webpackNodeConfig } = options;
  const app = express();
  const compiler = webpack(webpackBrowserConfig);
  core.initializeServer(app, 'develop');
  app.use((req, res, next) => {
    res.locals.noRewrite = req.url === '/__webpack_hmr';
    next();
  });
  app.use(rewriteMiddleware(options));
  app.use(
    webpackDevMiddleware(compiler, {
      noInfo: true,
      logLevel: 'warn',
      publicPath: webpackBrowserConfig.output.publicPath,
      watchOptions: webpackBrowserConfig.watchOptions,
      serverSideRender: true,
    })
  );
  app.use(webpackHotMiddleware(compiler));
  app.use(express.static(config.buildDir, { redirect: false }));
  app.use(assetsMiddleware());
  app.use(
    transpilerMiddleware(
      webpackNodeConfig,
      webpackNodeConfig.watchOptions || webpackBrowserConfig.watchOptions
    )
  );
  core.finalizeServer(app, 'develop');
  return app;
};

export default (...args) => runServer(createServer(...args));
