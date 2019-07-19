const { join } = require('path');
const { writeFileSync } = require('fs');

const { sync: mkdirp } = require('mkdirp');
const supertest = require('supertest');

const run = require('./run');

const { normalizeResponse, normalizeArgTypes } = require('./normalize');

const prepareDir = (rootDir) => {
  const distDir = join(rootDir, 'dist', 'public');
  const indexFile = join(distDir, 'index.html');
  mkdirp(distDir);
  writeFileSync(indexFile, '<h3>meep</h3>');
};

module.exports = (...args) =>
  run(...args).then((api) => {
    const { events } = require(join(api.rootDir, 'instrument', 'mixin.core'));
    prepareDir(api.rootDir);
    return {
      getArgTypes(...args) {
        return events
          .promiseArgs(...args)
          .then((args) => normalizeArgTypes(args));
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
