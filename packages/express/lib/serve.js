'use strict';

const { create: createDomain } = require('domain');

const debug = require('debug')('untool:express');
const isPlainObject = require('is-plain-object');
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
  phases.forEach((phase) => {
    const container = /final/.test(phase) ? app : router;
    middlewares[phase].forEach((middleware) => {
      if (isPlainObject(middleware)) {
        const { method = 'all', path = '*', handler } = middleware;
        const handlers = [].concat(handler);
        container[method](
          path,
          ...handlers.map((handler) => domain.bind(handler))
        );
      } else {
        const middlewares = [].concat(middleware);
        container.use(
          ...middlewares.map((middleware) => domain.bind(middleware))
        );
      }
    });
  });
  app.locals.domain = domain;

  return app;
};
