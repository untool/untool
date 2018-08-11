#!/usr/bin/env node
'use strict';

const { dirname } = require('path');

const { sync: findUp } = require('find-up');
const { sync: resolve } = require('enhanced-resolve');

const getRootDir = () => {
  const pkgFile = findUp('package.json');
  if (!pkgFile) throw new Error("Can't resolve package.json");
  return dirname(pkgFile);
};

const configure = (config = { mixins: [__dirname] }) =>
  Object.assign(exports, {
    run() {
      try {
        const rootDir = getRootDir();
        const yargsPath = resolve(rootDir, '@untool/yargs');
        const yargs = require(yargsPath);
        yargs.configure(config).run();
      } catch (error) {
        if (error.message && error.message.startsWith("Can't resolve")) {
          // eslint-disable-next-line no-console
          console.error("Error: Can't find @untool/yargs \n");
        } else {
          // eslint-disable-next-line no-console
          console.error(
            error.stack ? error.stack.toString() : error.toString()
          );
        }
        process.exit(1);
      }
    },
    configure,
  });
configure();

if (require.main === module) {
  exports.run();
}
