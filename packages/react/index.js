'use strict';

exports.internal = {
  babelPlugin: require('./lib/babel'),
  template: require('./lib/template'),
  runtime: require('./lib/runtime'),
};

exports.configure = () => ({ ...exports });
