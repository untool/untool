'use strict';

const { resolve } = require('path');

const {
  EnvironmentPlugin,
  NamedModulesPlugin,
  optimize: { LimitChunkCountPlugin },
} = require('webpack');

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
      cacheIdentifier: `${process.env.NODE_ENV || 'development'}:node`,
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            modules: false,
            useBuiltIns: 'entry',
            targets: { node: config.node },
          },
        ],
      ],
      plugins: [require.resolve('babel-plugin-dynamic-import-node')],
      sourceType: 'unambiguous',
    },
  };

  const urlLoaderConfig = {
    test: [/\.(png|gif|jpe?g|webp)$/],
    loader: require.resolve('url-loader'),
    options: {
      limit: 10000,
      name: getAssetPath('[name]-[hash:16].[ext]'),
      emitFile: false,
    },
  };

  const fileLoaderConfig = {
    exclude: [/\.(?:js|html|json)$/],
    loader: require.resolve('file-loader'),
    options: {
      name: getAssetPath('[name]-[hash:16].[ext]'),
      emitFile: false,
    },
  };

  const allLoaderConfigs = [jsLoaderConfig, urlLoaderConfig, fileLoaderConfig];

  return {
    // invalid for webpack, required with untool
    loaderConfigs: {
      jsLoaderConfig,
      urlLoaderConfig,
      fileLoaderConfig,
      allLoaderConfigs,
    },
    name: 'node',
    target: 'node',
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    bail: process.env.NODE_ENV === 'production',
    context: config.rootDir,
    entry: require.resolve('../shims/server'),
    output: {
      path: config.serverDir,
      publicPath: '/',
      pathinfo: true,
      filename: config.serverFile,
      libraryTarget: 'commonjs2',
      devtoolModuleFilenameTemplate: (info) =>
        resolve(info.absoluteResourcePath),
    },
    resolve: {
      alias: { '@untool/entrypoint': config.rootDir },
      extensions: ['.js'],
      mainFields: [
        'esnext:server',
        'jsnext:server',
        'server',
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
      minimizer: [],
    },
    plugins: [
      new LimitChunkCountPlugin({ maxChunks: 1 }),
      new NamedModulesPlugin(),
      new EnvironmentPlugin({ NODE_ENV: 'development' }),
    ],
    performance: { hints: false },
    devtool: 'inline-source-map',
    watchOptions: { aggregateTimeout: 300, ignored: /node_modules/ },
  };
};
