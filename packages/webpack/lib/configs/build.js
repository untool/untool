const { relative } = require('path');

const {
  EnvironmentPlugin,
  HashedModuleIdsPlugin,
  optimize,
} = require('webpack');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const {
  uri: { resolveRelative },
} = require('@untool/express');

const { isESNext } = require('../utils/helpers');

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
      cacheIdentifier: `${process.env.NODE_ENV || 'development'}:build`,
      presets: [
        [
          require.resolve('babel-preset-env'),
          {
            modules: false,
            useBuiltIns: true,
            targets: { browsers: config.browsers },
          },
        ],
      ],
      plugins: [require.resolve('babel-plugin-syntax-dynamic-import')],
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

  const webpackConfig = {
    name: 'build',
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    bail: process.env.NODE_ENV === 'production',
    context: config.rootDir,
    entry: {
      [config.name]: require.resolve('../shims/browser'),
    },
    output: {
      path: config.buildDir,
      publicPath: '/',
      pathinfo: true,
      filename: getAssetPath('[name]-[chunkhash:12].js'),
      chunkFilename: getAssetPath('[name]-[chunkhash:12].js'),
      devtoolModuleFilenameTemplate: (info) =>
        relative(config.rootDir, info.absoluteResourcePath),
    },
    resolve: {
      alias: {
        untool: '@untool/core',
        '@untool/entrypoint': config.rootDir,
        '@untool/config': require.resolve('../shims/loader'),
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
        'module',
        'main',
      ],
    },
    module: {
      rules: [
        {
          test: require.resolve('../shims/loader'),
          loader: require.resolve('../utils/loader'),
          options: { target: 'browser', config },
        },
        {
          oneOf: allLoaderConfigs,
        },
      ],
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
          uglifyOptions: {
            output: { comments: false },
          },
        }),
      ],
    },
    plugins: [
      new HashedModuleIdsPlugin(),
      new optimize.ModuleConcatenationPlugin(),
      new EnvironmentPlugin({ NODE_ENV: 'development' }),
    ],
    devtool: 'source-map',
  };

  const loaderConfigs = {
    jsLoaderConfig,
    urlLoaderConfig,
    fileLoaderConfig,
    allLoaderConfigs,
  };

  return configureBuild(webpackConfig, loaderConfigs);
};
