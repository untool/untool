'use strict';

module.exports = (resolvable) => {
  return function assetsMiddleware(req, res, next) {
    resolvable
      .then((assets) => {
        res.locals = { ...res.locals, ...assets };
        next();
      })
      .catch(next);
  };
};
