'use strict';

const { resolve } = require('path');

const {
  EnvironmentPlugin,
  HotModuleReplacementPlugin,
  HashedModuleIdsPlugin,
  NamedModulesPlugin,
  optimize: { LimitChunkCountPlugin },
} = require('webpack');

const { join, trimSlashes } = require('pathifist');

const getModules = require('../utils/modules');

module.exports = function getConfig(config, name) {
  const getAssetPath = (...arg) => trimSlashes(join(config.assetPath, ...arg));
  const isProduction = process.env.NODE_ENV === 'production';

  const jsLoaderConfig = {
    test: [/\.m?js$/],
    exclude: [/node_modules\/core-js/],
    loader: require.resolve('babel-loader'),
    options: {
      babelrc: false,
      compact: isProduction,
      cacheDirectory: true,
      cacheIdentifier: `${process.env.NODE_ENV || 'development'}:${name}`,
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            modules: false,
            useBuiltIns: 'entry',
            targets: { node: config.node },
            include: [],
            exclude: [],
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
    exclude: [/\.(?:m?js|html|json)$/],
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
    name,
    target: 'node',
    mode: isProduction ? 'production' : 'development',
    bail: isProduction,
    context: config.rootDir,
    entry: isProduction
      ? require.resolve('../shims/server')
      : [
          require.resolve('webpack/hot/signal'),
          require.resolve('../shims/server'),
        ],
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
      modules: getModules(config.rootDir),
      alias: { '@untool/entrypoint': config.rootDir },
      extensions: ['.mjs', '.js'],
      mainFields: [
        'esnext:server',
        'jsnext:server',
        'server',
        'module',
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
    externals: [],
    optimization: {
      minimizer: [],
    },
    plugins: [
      new LimitChunkCountPlugin({ maxChunks: 1 }),
      new (isProduction ? HashedModuleIdsPlugin : NamedModulesPlugin)(),
      isProduction ? { apply: () => {} } : new HotModuleReplacementPlugin(),
      new EnvironmentPlugin({ NODE_ENV: 'development' }),
    ],
    performance: { hints: false },
    devtool: isProduction ? 'source-map' : 'cheap-module-eval-source-map',
    watchOptions: { aggregateTimeout: 300, ignored: /node_modules/ },
  };
};
