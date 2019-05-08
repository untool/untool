const { join } = require('path');

const supertest = require('supertest');

const {
  normalizeConfig,
  normalizeMixin,
  normalizeResponse,
  normalizeArgTypes,
} = require('./normalize');

module.exports = (apiPromise) =>
  apiPromise.then((api) => {
    const { events } = require(join(api.rootDir, 'instrument', 'mixin.server'));
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
          .then((args) => normalizeArgTypes(args));
      },
      getConfig() {
        return events
          .promiseArg('constructor', 1)
          .then((config) => normalizeConfig(config));
      },
      getMixin() {
        return events
          .promiseArg('constructor', 0)
          .then((mixin) => normalizeMixin(mixin));
      },
      navigate(...args) {
        return new Promise((resolve) =>
          process.nextTick(() =>
            resolve(
              api
                .getServer()
                .then((server) => supertest(server))
                .then((request) => request.get(...args))
                .then(({ status, text: body }) =>
                  normalizeResponse({ status, body })
                )
            )
          )
        );
      },
    };
  });
