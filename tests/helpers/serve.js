const { join } = require('path');

const supertest = require('supertest');

const run = require('./run');

const {
  normalizeConfig,
  normalizeMixin,
  normalizeResponse,
  normalizeArgTypes,
} = require('./normalize');

module.exports = (...args) =>
  run(...args).then(api => {
    const { events } = require(join(api.rootDir, 'server'));
    return {
      getArg(...args) {
        return events.promiseArg(...args);
      },
      getArgs(...args) {
        return events.promiseArgs(...args);
      },
      getArgTypes(...args) {
        return events
          .promiseArgs(...args)
          .then(args => normalizeArgTypes(args));
      },
      getCore() {
        return events.promiseArg('constructor', 1);
      },
      getConfig() {
        return events
          .promiseArg('constructor', 2)
          .then(config => normalizeConfig(config));
      },
      getMixin() {
        return events
          .promiseArg('constructor', 0)
          .then(mixin => normalizeMixin(mixin));
      },
      navigate(...args) {
        return new Promise(resolve =>
          process.nextTick(() =>
            resolve(
              api
                .getServer()
                .then(server => supertest(server))
                .then(request => request.get(...args))
                .then(({ status, text: body }) =>
                  normalizeResponse({ status, body })
                )
            )
          )
        );
      },
    };
  });
