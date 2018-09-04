'use strict';

module.exports = (assets) => {
  return function assetsMiddleware(req, res, next) {
    assets.registerCallback((error, assets) => {
      if (error) {
        next(error);
      } else {
        res.locals = { ...res.locals, ...assets };
        next();
      }
    });
  };
};
