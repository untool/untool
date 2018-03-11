const { relative } = require('path');

const {
  EnvironmentPlugin,
  HashedModuleIdsPlugin,
  optimize,
} = require('webpack');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const postcssImportPlugin = require('postcss-import');
const postcssNextPlugin = require('postcss-cssnext');

const { checkESNext, getResolveConfig } = require('../utils/helpers');

module.exports = function getConfig(config, getAssetPath, configureWebpack) {
  const jsLoaderConfig = {
    test: [/\.m?js$/],
    include: checkESNext,
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
      plugins: [
        require.resolve('babel-plugin-syntax-dynamic-import'),
        require.resolve('babel-plugin-transform-class-properties'),
        require.resolve('babel-plugin-transform-object-rest-spread'),
      ],
    },
  };

  const cssLoaderConfig = {
    test: [/\.css$/],
    use: ExtractTextPlugin.extract({
      fallback: require.resolve('style-loader'),
      use: [
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
    }),
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
    name: 'build',
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    bail: process.env.NODE_ENV === 'production',
    context: config.rootDir,
    entry: {
      [config.namespace]: require.resolve('../shims/browser'),
    },
    output: {
      path: config.buildDir,
      publicPath: '/',
      pathinfo: true,
      filename: getAssetPath('[name]-[chunkhash:16].js'),
      chunkFilename: getAssetPath('[name]-[id]-[chunkhash:16].js'),
      devtoolModuleFilenameTemplate: function(info) {
        return relative(config.rootDir, info.absoluteResourcePath);
      },
    },
    resolve: getResolveConfig('browser', {
      alias: {
        untool: '@untool/core',
        '@untool/entrypoint': config.rootDir,
        '@untool/config': require.resolve('../shims/loader'),
      },
    }),
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
        cacheGroups: {
          vendor: {
            chunks: 'initial',
            test: /node_modules/,
            name: config.vendorName,
            enforce: true,
          },
        },
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
      new ExtractTextPlugin({
        filename: getAssetPath('[name]-[contenthash:16].css'),
        allChunks: true,
        ignoreOrder: true,
      }),
      new HashedModuleIdsPlugin(),
      new EnvironmentPlugin({
        NODE_ENV: 'development',
      }),
      new optimize.ModuleConcatenationPlugin(),
    ],
    devtool: 'source-map',
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
