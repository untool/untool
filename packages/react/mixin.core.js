'use strict';

const { Mixin } = require('@untool/core');

module.exports = class ReactMixin extends Mixin {
  configureBuild(webpackConfig, loaderConfigs, target) {
    const { fileLoaderConfig, jsLoaderConfig } = loaderConfigs;

    webpackConfig.resolve.extensions.push('.jsx');

    fileLoaderConfig.exclude.push(/\.jsx$/);

    jsLoaderConfig.test.push(/\.jsx$/);
    jsLoaderConfig.options.presets.push(require.resolve('@babel/preset-react'));
    if (target !== 'develop' && process.env.NODE_ENV === 'production') {
      jsLoaderConfig.options.plugins.push(
        require.resolve('babel-plugin-transform-react-remove-prop-types')
      );
    }
    jsLoaderConfig.options.plugins.push([
      require.resolve('./lib/babel'),
      { target },
    ]);

    return webpackConfig;
  }
};
