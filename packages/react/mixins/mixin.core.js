'use strict';

const { Mixin } = require('@untool/core');

module.exports = class ReactMixin extends Mixin {
  configureBuild(webpackConfig, { fileLoaderConfig, jsLoaderConfig }, target) {
    webpackConfig.resolve.extensions.push('.jsx');
    fileLoaderConfig.exclude.push(/\.jsx$/);
    jsLoaderConfig.test.push(/\.jsx$/);

    webpackConfig.entry = [require.resolve('core-js/es6/symbol')].concat(
      webpackConfig.entry
    );

    jsLoaderConfig.exclude.push(
      /node_modules\/react-helmet/,
      /node_modules\/react-dom/,
      /node_modules\/react/
    );

    jsLoaderConfig.options.presets.push(require.resolve('@babel/preset-react'));

    if (target !== 'develop' && process.env.NODE_ENV === 'production') {
      jsLoaderConfig.options.plugins.push(
        require.resolve('babel-plugin-transform-react-remove-prop-types')
      );
    }
    jsLoaderConfig.options.plugins.push(require.resolve('../lib/babel'));
  }
};
