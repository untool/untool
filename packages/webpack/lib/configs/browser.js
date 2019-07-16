'use strict';

const { relative } = require('path');

const {
  EnvironmentPlugin,
  HashedModuleIdsPlugin,
  HotModuleReplacementPlugin,
  NamedModulesPlugin,
  optimize: { ModuleConcatenationPlugin },
} = require('webpack');

const TerserPlugin = require('terser-webpack-plugin');

const { join, trimSlashes } = require('pathifist');

const getModules = require('../utils/modules');

module.exports = function getConfig(config, name, watch) {
  const getAssetPath = (...arg) => trimSlashes(join(config.assetPath, ...arg));
  const isProduction = process.env.NODE_ENV === 'production';

  const jsLoaderConfig = {
    test: [/\.m?js$/],
    exclude: [/node_modules[/\\]core-js/],
    loader: require.resolve('babel-loader'),
    options: {
      babelrc: false,
      compact: isProduction,
      cacheDirectory: true,
      cacheIdentifier: `${process.env.NODE_ENV || 'development'}:browser`,
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            modules: false,
            useBuiltIns: 'usage',
            targets: { browsers: config.browsers },
            corejs: 2,
            include: [],
            exclude: [],
          },
        ],
      ],
      plugins: [require.resolve('@babel/plugin-syntax-dynamic-import')],
      sourceType: 'unambiguous',
    },
  };

  const fileLoaderConfig = {
    exclude: [/\.(?:m?js|html|json)$/],
    loader: require.resolve('file-loader'),
    options: {
      name: getAssetPath('[name]-[hash:16].[ext]'),
    },
  };

  const urlLoaderConfig = {
    test: [/\.(png|gif|jpe?g|webp)$/],
    oneOf: [
      {
        resourceQuery: /noinline/,
        ...fileLoaderConfig,
      },
      {
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: getAssetPath('[name]-[hash:16].[ext]'),
        },
      },
    ],
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
    name: 'browser',
    mode: isProduction ? 'production' : 'development',
    bail: isProduction,
    context: config.rootDir,
    entry: require.resolve(watch ? '../shims/develop' : '../shims/build'),
    output: {
      path: config.buildDir,
      publicPath: '/',
      pathinfo: true,
      filename: getAssetPath(
        `${config.name}${watch ? '' : '-[chunkhash:12]'}.js`
      ),
      chunkFilename: getAssetPath(
        `${config.name}-[id]${watch ? '' : '-[chunkhash:12]'}.js`
      ),
      devtoolModuleFilenameTemplate: (info) =>
        relative(config.rootDir, info.absoluteResourcePath),
    },
    resolve: {
      modules: getModules(config.rootDir),
      alias: {
        '@untool/entrypoint': config.rootDir,
      },
      extensions: ['.mjs', '.js'],
      mainFields: [
        'esnext:browser',
        'jsnext:browser',
        'browser',
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
      splitChunks: {
        chunks: 'all',
        name: false,
      },
      minimizer: isProduction
        ? [
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
          ]
        : [],
    },
    plugins: [
      new (isProduction ? HashedModuleIdsPlugin : NamedModulesPlugin)(),
      new (watch ? HotModuleReplacementPlugin : ModuleConcatenationPlugin)(),
      new EnvironmentPlugin({ NODE_ENV: 'development' }),
    ],
    performance: {
      hints: false,
      maxEntrypointSize: isProduction ? 262144 : 5242880,
      maxAssetSize: isProduction ? 262144 : 5242880,
      assetFilter: (filename) => filename.endsWith('.js'),
    },
    devtool: watch ? 'cheap-module-eval-source-map' : 'hidden-source-map',
    watchOptions: { aggregateTimeout: 300, ignored: /node_modules/ },
  };
};
