'use strict';

const { getOptions } = require('loader-utils');

// eslint-disable-next-line no-unused-vars
const getConfig = (type, { _config: { mixins: _, ...config } }) =>
  JSON.stringify(config).replace(
    new RegExp(`"${config.rootDir}(.*?)"`, 'g'),
    type === 'server' ? 'expand(".$1")' : '".$1"'
  );

const getMixins = (type, { mixins }) =>
  `[${(mixins[type] || [])
    .map((mixin) => `((m) => m.default || m )(require('${mixin}'))`)
    .join(',')}]`;

module.exports = function configLoader() {
  this.cacheable();
  const { type, config } = getOptions(this);
  return [
    ...(type === 'server'
      ? [
          'const path = require("path");',
          'const findUp = require("find-up").sync;',
          'const root = path.dirname(findUp("package.json"));',
          'const expand = path.join.bind(path, root);',
        ]
      : []),
    `const { environmentalize, placeholdify, merge } = require('./utils');`,
    `const override = merge.bind(null, ${getConfig(type, config)});`,
    `const functions = [override, placeholdify, environmentalize];`,
    `const getConfig = functions.reduce.bind(functions, (res, fn) => fn(res));`,
    `exports.getConfig = (overrides) => getConfig(overrides);`,
    `exports.getMixins = () => ${getMixins(type, config)};`,
  ].join('\n');
};
