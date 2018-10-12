'use strict';

const { matchesUA } = require('browserslist-useragent');

module.exports = function createAgentMiddleware(browsers) {
  return function agentMiddleware(req, res, next) {
    const userAgent = req.headers['user-agent'] || '';
    const options = {
      browsers: typeof browsers === 'string' ? [browsers] : browsers,
      ignorePatch: true,
      ignoreMinor: true,
      allowHigherVersions: true,
    };
    const supportedUserAgent = matchesUA(userAgent, options);
    res.locals = { ...res.locals, supportedUserAgent };
    next();
  };
};
