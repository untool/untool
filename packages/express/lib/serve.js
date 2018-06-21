const express = require('express');

module.exports = (mode, { configureServer }) => {
  const phases = ['initial', 'session', 'parse', 'files', 'routes', 'final'];
  const middlewares = phases.reduce(
    (result, key) => {
      const additions = { [`pre${key}`]: [], [key]: [], [`post${key}`]: [] };
      return {
        ...result,
        ...additions,
        middlewareOrder: result.middlewareOrder.concat(Object.keys(additions)),
      };
    },
    { middlewareOrder: [] }
  );
  const app = configureServer(express(), middlewares, mode);
  const { middlewareOrder } = middlewares;
  middlewareOrder.forEach(
    (phase) =>
      Array.isArray(middlewares[phase]) &&
      middlewares[phase].forEach(
        (middleware) =>
          Array.isArray(middleware)
            ? app.use(...middleware)
            : app.use(middleware)
      )
  );
  return app;
};
