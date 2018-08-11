'use strict';

const debug = require('debug')('untool:express');
const express = require('express');

const { Router } = express;

module.exports = (mode, { configureServer }) => {
  const phases = ['initial', 'files', 'parse', 'routes', 'final'].reduce(
    (result, key) => result.concat(`pre${key}`, key, `post${key}`),
    []
  );
  const middlewares = phases.reduce(
    (result, key) => ({ ...result, [key]: [] }),
    { phases }
  );
  const router = new Router();
  const app = configureServer(express(), middlewares, mode).use(router);
  debug(middlewares);
  phases.forEach((phase) =>
    middlewares[phase].forEach((middleware) =>
      (/final/.test(phase) ? app : router).use(...[].concat(middleware))
    )
  );
  return app;
};
