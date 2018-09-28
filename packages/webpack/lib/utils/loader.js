'use strict';

const { getOptions } = require('loader-utils');

const {
  internal: { environmentalize },
} = require('@untool/core');

const getConfig = (type, config) =>
  JSON.stringify(
    Object.assign({}, config._config, { mixins: undefined })
  ).replace(
    new RegExp(`"${config.rootDir}(.*?)"`, 'g'),
    type === 'server' ? 'expand(".$1")' : '".$1"'
  );

const getMixins = (type, config) =>
  `[${(config.mixins[type] || [])
    .map((mixin) => `((m) => m.default || m )(require('${mixin}'))`)
    .join(',')}]`;

const injectVariables = (source, { type, config, mainMethod = 'render' }) =>
  source.replace(
    '/* this will be replaced by our webpack loader */',
    [
      ...(type === 'server'
        ? [
            'const path = require("path");',
            'const findUp = require("find-up").sync;',
            'const root = path.dirname(findUp("package.json"));',
            'const expand = path.join.bind(path, root);',
          ]
        : []),
      'const isPlainObject = require("is-plain-object");',
      `const environmentalize = ${environmentalize.toString()};`,
      `const getConfig = () => environmentalize(${getConfig(type, config)});`,
      `const getMixins = () => ${getMixins(type, config)};`,
      `const mainMethod = ${JSON.stringify(mainMethod)};`,
    ].join('\n')
  );

module.exports = function(content) {
  this.cacheable();
  return injectVariables(content, getOptions(this));
};
