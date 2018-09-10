'use strict';

const clone = require('clone');

module.exports = ({ assets: resolvable }) => {
  return function assetDataMiddleware(req, res, next) {
    resolvable
      .then((assets) => {
        res.locals = { ...res.locals, ...clone(assets, false) };
        next();
      })
      .catch(next);
  };
};
