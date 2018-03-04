import express from 'express';

import { runServer } from './serve';
import rewriteMiddleware from './rewrite';

export const createServer = (options, core, config) => {
  const app = express();
  core.initializeServer(app, 'develop');
  app.use(rewriteMiddleware(options, config));
  core.optimizeServer(app, 'develop');
  core.finalizeServer(app, 'develop');
  return app;
};

export default (options, core, config) =>
  runServer(createServer(options, core, config), core, config);
