'use strict';

const clone = require('clone');

module.exports = function createStatsMiddleware({ stats: resolvable }) {
  return function statsMiddleware(req, res, next) {
    resolvable
      .then((stats) => {
        res.locals = { ...res.locals, stats: clone(stats, false) };
        next();
      })
      .catch(next);
  };
};
