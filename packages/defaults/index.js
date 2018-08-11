'use strict';

const configure = (...args) =>
  Object.assign(exports, {
    ...require('@untool/yargs').configure(...args),
    ...require('@untool/express').configure(...args),
    ...require('@untool/webpack').configure(...args),
    ...require('@untool/react').configure(...args),
    configure,
  });
configure();
