'use strict';

module.exports = (assets) => {
  return function assetsMiddleware(req, res, next) {
    assets
      .then((assets) => {
        res.locals = { ...res.locals, ...assets };
        next();
      })
      .catch(next);
  };
};
