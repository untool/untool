const { relative } = require('path');

const debug = require('debug')('untool:webpack:develop');
const {
  DefinePlugin,
  HotModuleReplacementPlugin,
  NamedModulesPlugin,
} = require('webpack');

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
      compact: false,
      cacheDirectory: true,
      cacheIdentifier: `development:develop`,
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
    name: 'develop',
    mode: 'development',
    context: config.rootDir,
    entry: {
      [config.name]: [
        require.resolve('webpack-hot-middleware/client'),
        require.resolve('../shims/browser'),
      ],
    },
    output: {
      path: config.buildDir,
      publicPath: '/',
      pathinfo: true,
      filename: getAssetPath('[name].js'),
      chunkFilename: getAssetPath('[name]-[id].js'),
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
        'module-browser',
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
    plugins: [
      new HotModuleReplacementPlugin(),
      new NamedModulesPlugin(),
      new DefinePlugin({
        'process.env.NODE_ENV': '"development"',
      }),
    ],
    performance: {
      hints: false,
    },
    devtool: 'cheap-module-eval-source-map',
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
    },
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
