'use strict';

const { resolve } = require('path');

const {
  EnvironmentPlugin,
  HashedModuleIdsPlugin,
  NamedModulesPlugin,
  optimize: { LimitChunkCountPlugin },
} = require('webpack');

const { join, trimSlashes } = require('pathifist');

module.exports = function getConfig(config, name) {
  const getAssetPath = (...arg) => trimSlashes(join(config.assetPath, ...arg));
  const isProduction = process.env.NODE_ENV === 'production';

  const jsLoaderConfig = {
    test: [/\.js$/],
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
            useBuiltIns: 'usage',
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
    name,
    target: 'node',
    mode: isProduction ? 'production' : 'development',
    bail: isProduction,
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
    externals: [],
    optimization: {
      minimizer: [],
    },
    plugins: [
      new LimitChunkCountPlugin({ maxChunks: 1 }),
      new (isProduction ? HashedModuleIdsPlugin : NamedModulesPlugin)(),
      new EnvironmentPlugin({ NODE_ENV: 'development' }),
    ],
    performance: { hints: false },
    devtool: 'inline-source-map',
    watchOptions: { aggregateTimeout: 300, ignored: /node_modules/ },
  };
};
