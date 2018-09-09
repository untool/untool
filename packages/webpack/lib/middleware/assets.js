'use strict';

module.exports = ({ assets: resolvable }) => {
  return function assetDataMiddleware(req, res, next) {
    resolvable
      .then((assets) => {
        res.locals = { ...res.locals, ...assets };
        next();
      })
      .catch(next);
  };
};
