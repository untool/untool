'use strict';

const { relative } = require('path');

const {
  EnvironmentPlugin,
  HotModuleReplacementPlugin,
  NamedModulesPlugin,
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
      compact: false,
      cacheDirectory: true,
      cacheIdentifier: `development:develop`,
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
    name: 'develop',
    mode: 'development',
    context: config.rootDir,
    entry: [
      require.resolve('webpack-hot-middleware/client'),
      require.resolve('../shims/browser'),
    ],
    output: {
      path: config.buildDir,
      publicPath: '/',
      pathinfo: true,
      filename: getAssetPath(`${config.name}.js`),
      chunkFilename: getAssetPath(`${config.name}-[id].js`),
      devtoolModuleFilenameTemplate: (info) =>
        relative(config.rootDir, info.absoluteResourcePath),
    },
    resolve: {
      alias: { '@untool/entrypoint': config.rootDir },
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
    },
    plugins: [
      new HotModuleReplacementPlugin(),
      new NamedModulesPlugin(),
      new EnvironmentPlugin({ NODE_ENV: 'development' }),
    ],
    performance: { hints: false },
    devtool: 'cheap-module-eval-source-map',
    watchOptions: { aggregateTimeout: 300, ignored: /node_modules/ },
  };
};
