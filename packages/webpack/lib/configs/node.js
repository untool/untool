const { resolve } = require('path');

const debug = require('debug')('untool:webpack:node');
const { EnvironmentPlugin, optimize } = require('webpack');

const {
  uri: { resolveRelative },
} = require('@untool/express');

const { isESNext, isExternal } = require('../utils/helpers');

module.exports = function getConfig(config, configureBuild) {
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
          require.resolve('babel-preset-env'),
          {
            modules: false,
            useBuiltIns: true,
            targets: { node: 'current' },
          },
        ],
      ],
      plugins: [require.resolve('babel-plugin-dynamic-import-node')],
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

  const webpackConfig = {
    name: 'node',
    target: 'node',
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    bail: process.env.NODE_ENV === 'production',
    context: config.rootDir,
    entry: {
      [config.name]: require.resolve('../shims/node'),
    },
    output: {
      path: config.buildDir,
      publicPath: '/',
      pathinfo: true,
      filename: config.serverFile,
      libraryTarget: 'commonjs2',
      devtoolModuleFilenameTemplate: (info) =>
        resolve(info.absoluteResourcePath),
    },
    resolve: {
      alias: {
        '@untool/entrypoint': config.rootDir,
      },
      extensions: ['.js'],
      mainFields: [
        'esnext:server',
        'jsnext:server',
        'server',
        'esnext',
        'jsnext',
        'esnext:main',
        'jsnext:main',
        'module',
        'main',
      ],
    },
    externals: isExternal(),
    module: {
      rules: [
        {
          test: require.resolve('../shims/loader'),
          loader: require.resolve('../utils/loader'),
          options: { target: 'server', config },
        },
        {
          oneOf: allLoaderConfigs,
        },
      ],
    },
    optimization: {
      minimizer: [],
    },
    plugins: [
      new optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new EnvironmentPlugin({
        NODE_ENV: 'development',
      }),
    ],
    performance: {
      hints: false,
    },
    devtool: process.env.NODE_ENV !== 'production' && 'inline-source-map',
  };

  const loaderConfigs = {
    jsLoaderConfig,
    urlLoaderConfig,
    fileLoaderConfig,
    allLoaderConfigs,
  };

  const result = configureBuild(webpackConfig, loaderConfigs);

  debug(result);

  return result;
};
