'use strict';

const { create: createDomain } = require('domain');

const debug = require('debug')('untool:express');
const express = require('express');

const { Router } = express;

module.exports = (mode, { configureServer }) => {
  const phases = ['initial', 'files', 'parse', 'routes', 'final'].reduce(
    (result, key) => [...result, `pre${key}`, key, `post${key}`],
    []
  );
  const middlewares = phases.reduce(
    (result, key) => ({ ...result, [key]: [] }),
    { phases }
  );
  const app = express();
  const router = new Router();
  const domain = createDomain();

  configureServer(app, middlewares, mode);
  debug(middlewares);

  app.use(router);
  phases.forEach((phase) =>
    middlewares[phase].forEach((middleware) =>
      (/final/.test(phase) ? app : router).use(
        ...(Array.isArray(middleware) ? middleware : [middleware]).map(
          (middleware) => domain.bind(middleware)
        )
      )
    )
  );
  app.locals.domain = domain;

  return app;
};
