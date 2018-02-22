import { relative } from 'path';

import {
  DefinePlugin,
  HotModuleReplacementPlugin,
  NamedModulesPlugin,
} from 'webpack';

import postcssImportPlugin from 'postcss-import';
import postcssNextPlugin from 'postcss-cssnext';

import config from '../config';
import core from '../core';

import { checkESNext, getAssetPath, resolve } from '../utils/webpack';

const jsLoaderConfig = {
  test: [/\.m?js$/],
  include: checkESNext,
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
    plugins: [
      require.resolve('babel-plugin-syntax-dynamic-import'),
      require.resolve('babel-plugin-transform-class-properties'),
      require.resolve('babel-plugin-transform-object-rest-spread'),
    ],
  },
};

const cssLoaderConfig = {
  test: [/\.css$/],
  use: [
    require.resolve('style-loader'),
    {
      loader: require.resolve('css-loader'),
      options: {
        importLoaders: 1,
        camelCase: true,
        modules: !!config.cssModules,
        localIdentName: config.cssModules,
        sourceMap: process.env.NODE_ENV !== 'production',
      },
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        ident: 'postcss',
        plugins: [
          postcssImportPlugin(),
          postcssNextPlugin({
            browsers: config.browsers,
          }),
        ],
      },
    },
  ],
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
  exclude: [/\.(?:m?js|html|json)$/],
  loader: require.resolve('file-loader'),
  options: {
    name: getAssetPath('[name]-[hash:16].[ext]'),
  },
};

const allLoaderConfigs = [
  jsLoaderConfig,
  cssLoaderConfig,
  urlLoaderConfig,
  fileLoaderConfig,
];

const webpackConfig = {
  name: 'develop',
  mode: 'development',
  context: config.rootDir,
  entry: {
    [config.namespace]: [
      require.resolve('webpack-hot-middleware/client'),
      require.resolve('./shims/browser'),
    ],
  },
  output: {
    path: config.buildDir,
    publicPath: '/',
    pathinfo: true,
    filename: getAssetPath('[name].js'),
    chunkFilename: getAssetPath('[name]-[id].js'),
    devtoolModuleFilenameTemplate: function(info) {
      return relative(config.rootDir, info.absoluteResourcePath);
    },
  },
  resolve: resolve('browser', {
    alias: {
      '@@ENTRYPOINT@@': config.rootDir,
      '@@CONFIG@@': require.resolve('./shims/loader'),
    },
  }),
  module: {
    rules: [
      {
        test: new RegExp(require.resolve('./shims/loader')),
        loader: require.resolve('../utils/loader'),
      },
      {
        oneOf: allLoaderConfigs,
      },
    ],
  },
  plugins: [
    {
      apply(compiler) {
        core.enhanceWebpack(compiler, 'develop');
      },
    },
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
  cssLoaderConfig,
  urlLoaderConfig,
  fileLoaderConfig,
  allLoaderConfigs,
};

export default core.configureWebpack(webpackConfig, loaderConfigs, 'develop');
