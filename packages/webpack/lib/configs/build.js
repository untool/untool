'use strict';

const { relative } = require('path');

const {
  EnvironmentPlugin,
  HashedModuleIdsPlugin,
  optimize: { ModuleConcatenationPlugin },
} = require('webpack');

const TerserPlugin = require('terser-webpack-plugin');

const {
  internal: {
    uri: { resolveRelative },
  },
} = require('@untool/express');

const { isESNext } = require('../utils/helpers');

module.exports = function getConfig(config) {
  const getAssetPath = resolveRelative.bind(null, config.assetPath);

  const jsLoaderConfig = {
    test: [/\.js$/],
    include: isESNext(),
    loader: require.resolve('babel-loader'),
    options: {
      babelrc: false,
      compact: process.env.NODE_ENV === 'production',
      cacheDirectory: true,
      cacheIdentifier: `${process.env.NODE_ENV || 'development'}:build`,
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            modules: false,
            useBuiltIns: 'usage',
            targets: { browsers: config.browsers },
          },
        ],
      ],
      plugins: [require.resolve('@babel/plugin-syntax-dynamic-import')],
      sourceType: 'unambiguous',
    },
  };

  const urlLoaderConfig = {
    test: [/\.(png|gif|jpe?g|webp)$/],
    loader: require.resolve('url-loader'),
    options: {
      limit: 10000,
      name: getAssetPath('[name]-[hash:16].[ext]'),
    },
  };

  const fileLoaderConfig = {
    exclude: [/\.(?:js|html|json)$/],
    loader: require.resolve('file-loader'),
    options: {
      name: getAssetPath('[name]-[hash:16].[ext]'),
    },
  };

  const allLoaderConfigs = [jsLoaderConfig, urlLoaderConfig, fileLoaderConfig];

  return {
    // invalid for webpack, needed with untool
    loaderConfigs: {
      jsLoaderConfig,
      urlLoaderConfig,
      fileLoaderConfig,
      allLoaderConfigs,
    },
    name: 'build',
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    bail: process.env.NODE_ENV === 'production',
    context: config.rootDir,
    entry: require.resolve('../shims/browser'),
    output: {
      path: config.buildDir,
      publicPath: '/',
      pathinfo: true,
      filename: getAssetPath(`${config.name}-[chunkhash:12].js`),
      chunkFilename: getAssetPath(`${config.name}-[id]-[chunkhash:12].js`),
      devtoolModuleFilenameTemplate: (info) =>
        relative(config.rootDir, info.absoluteResourcePath),
    },
    resolve: {
      alias: {
        '@untool/entrypoint': config.rootDir,
      },
      extensions: ['.js'],
      mainFields: [
        'esnext:browser',
        'jsnext:browser',
        'browser',
        'esnext',
        'jsnext',
        'esnext:main',
        'jsnext:main',
        'main',
      ],
    },
    module: {
      rules: [{ oneOf: allLoaderConfigs }],
    },
    optimization: {
      splitChunks: { chunks: 'all', name: false },
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
          terserOptions: {
            compress: {
              inline: 1, // https://github.com/mishoo/UglifyJS2/issues/2842
            },
            output: { comments: false },
          },
        }),
      ],
    },
    plugins: [
      new HashedModuleIdsPlugin(),
      new ModuleConcatenationPlugin(),
      new EnvironmentPlugin({ NODE_ENV: 'development' }),
    ],
    devtool: 'source-map',
  };
};
