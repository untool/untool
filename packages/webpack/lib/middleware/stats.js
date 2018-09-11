'use strict';

module.exports = function createStatsMiddleware({ stats: resolvable }) {
  return function statsMiddleware(req, res, next) {
    resolvable
      .then((stats) => {
        res.locals = { ...res.locals, stats };
        next();
      })
      .catch(next);
  };
};
