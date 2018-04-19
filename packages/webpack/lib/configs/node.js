const { join, dirname, resolve } = require('path');

const { sync: findUp } = require('find-up');

const { EnvironmentPlugin, optimize } = require('webpack');
const determineExternals = require('webpack-node-externals');

const { checkESNext, getResolveConfig } = require('../utils/helpers');

module.exports = function getConfig(config, getAssetPath, configureWebpack) {
  const getModulesDir = () => {
    const lernaFile = findUp('lerna.json');
    const baseDir = lernaFile ? dirname(lernaFile) : config.rootDir;
    return join(baseDir, 'node_modules');
  };
  const jsLoaderConfig = {
    test: [/\.js$/],
    include: checkESNext('server'),
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
            targets: { node: config.node },
          },
        ],
      ],
      plugins: [
        require.resolve('babel-plugin-dynamic-import-node'),
        require.resolve('babel-plugin-transform-class-properties'),
        require.resolve('babel-plugin-transform-object-rest-spread'),
      ],
    },
  };

  const cssLoaderConfig = {
    test: [/\.css$/],
    loader: require.resolve('css-loader/locals'),
    options: {
      camelCase: true,
      modules: true,
      localIdentName: '[folder]-[name]-[local]-[hash:8]',
      sourceMap: process.env.NODE_ENV !== 'production',
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

  const allLoaderConfigs = [
    jsLoaderConfig,
    cssLoaderConfig,
    urlLoaderConfig,
    fileLoaderConfig,
  ];

  const webpackConfig = {
    name: 'node',
    target: 'node',
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    bail: process.env.NODE_ENV === 'production',
    context: config.rootDir,
    entry: require.resolve('../shims/node'),
    output: {
      path: config.buildDir,
      publicPath: '/',
      pathinfo: true,
      filename: config.serverFile,
      libraryTarget: 'commonjs2',
      devtoolModuleFilenameTemplate: info => resolve(info.absoluteResourcePath),
    },
    resolve: getResolveConfig('server', {
      alias: {
        untool: '@untool/core',
        '@untool/entrypoint': config.rootDir,
        '@untool/config': require.resolve('../shims/loader'),
      },
    }),
    externals: [
      /tests\/fixtures\//,
      determineExternals({
        modulesDir: getModulesDir(),
        whitelist: checkESNext('server'),
      }),
    ],
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
    cssLoaderConfig,
    urlLoaderConfig,
    fileLoaderConfig,
    allLoaderConfigs,
  };

  return configureWebpack(webpackConfig, loaderConfigs);
};
