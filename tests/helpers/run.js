const { join } = require('path');

const uuid = require('uuid/v4');
const ncp = require('ncp');

const { configure } = require('@untool/yargs');

const {
  normalizeConfig,
  normalizeMixin,
  normalizeWebpackConfig,
  normalizeArtefacts,
  normalizeArgTypes,
} = require('./normalize');

const bootstrap = () =>
  Promise.resolve().then(() => {
    const fixtureDir = join(__dirname, '../fixtures/untest');
    const rootDir = `${fixtureDir}-${uuid()}`;
    return new Promise((resolve, reject) =>
      ncp(fixtureDir, rootDir, (error) => {
        if (error) {
          return reject(error);
        }
        resolve(rootDir);
      })
    );
  });

module.exports = (...args) =>
  bootstrap().then((rootDir) => {
    process.chdir(rootDir);
    process.nextTick(() =>
      configure({ mixins: [join(__dirname, 'instrument')] }).run(...args)
    );
    const { events } = require('./instrument/mixin.core');
    const api = {
      rootDir,
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
      getServer() {
        return events.promiseArg('inspectServer', 0);
      },
      getArtefacts() {
        return events
          .promise('inspectBuild')
          .then(() => new Promise((resolve) => process.nextTick(resolve)))
          .then(() => normalizeArtefacts(join(rootDir, 'dist')));
      },
      getWebpackConfig(target) {
        return events.promise(
          'configureBuild',
          (resolve) => (webpackConfig, loaderConfigs, _target) =>
            resolve(
              target === _target
                ? normalizeWebpackConfig(webpackConfig)
                : api.getWebpackConfig(target)
            )
        );
      },
    };
    return api;
  });
