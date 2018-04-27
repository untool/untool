# `@untool/webpack`

[![npm](https://img.shields.io/npm/v/@untool%2Fwebpack.svg)](https://www.npmjs.com/package/@untool%2Fwebpack)

`@untool/webpack` is the largest and most complex of `untool`'s core packages. It contains half of its total lines of code and provides both a [preset](https://github.com/untool/untool/blob/master/packages/core/README.md#presets) and a [core mixin](https://github.com/untool/untool/blob/master/packages/core/README.md#mixins). It provides a comprehensive, but rather minimal [`Webpack`](https://webpack.js.org) setup as a basis for your own configurations.

Based on [`@untool/express`](https://github.com/untool/untool/blob/master/packages/express/README.md), it also features development and production servers. The former even comes with [hot module replacement (HMR)](https://webpack.js.org/concepts/hot-module-replacement/).

### Installation

```bash
$ yarn add @untool/webpack # OR npm install @untool/webpack
```

## CLI

### `build`

This is the most basic of `@untool/webpack`'s commands - and it simply performs a Webpack build according to its arguments and configuration. It will not only start an usual browser build, but also one for the server-side version of your application.

Whether it uses said server-side build to generate static HTML pages depends on the arguments it is being called with - and it works best in tandem with `@untool/express`' [`serve` command](https://github.com/untool/untool/blob/master/packages/express/README.md#serve);

```bash
$ un build -ps && un serve -ps
```

#### Arguments

##### `-p` / `--production`

If `un build` is called with the `production` argument, `untool` itself sets the shell environment variable `$NODE_ENV` to `"production"`. This variable is generally used in lots of places, for example to fine-tune `@untool/webpack`'s Webpack configurations.

```bash
$ un build -p # OR un build --production
```

This is equivalent to manually setting `$NODE_ENV` before calling the actual command. Use whatever works best in your specific setting.

```bash
$ NODE_ENV=production un build
```

##### `-s` / `--static`

In `static` mode, static HTML pages will be generated for the [`locations`](https://github.com/untool/untool/blob/master/packages/express/README.md#locations) configured for your application. In `no-static` mode, `server.js` and `assets.json` files will be created instead.

### `develop`

Using this command, you can start a full-featured development server that is as similar to a production system as possible. It does, however, ensure the browser and server versions of your application are being recompiled and redeployed whenever you change your code.

```bash
$ un develop
```

#### Arguments

##### `-s` / `--static`

In static mode, `@untool/express` will rewrite request paths according to its `locations` configuration. You will want this if you want to use a single HTML file for multiple browser [`locations`](https://github.com/untool/untool/blob/master/packages/express/README.md#locations).

```bash
$ un develop -s # OR un develop --static
```

##### `-r` / `--rewrite`

Even in static mode, you can disable request path rewriting completely if you do not need `untool`'s location fallback mechanism.

```bash
$ un develop -sr=0 # OR un develop --static --no-rewrite`
```

### `start`

This is probably the `untool` command your will use most of the time - we certainly do. It is, essentially, just a shorthand for other `untool` commands.

```bash
$ un start # OR un start -p
```

#### Arguments

##### `-p` / `--production`

If called in `production` mode, `un start` will first perform a build and start an express server afterwards. Otherwise it will start a development server. `un start -ps` is thus equivalent to `un start -ps && un serve -ps`, while `un start -s` is equivalent to `un develop -s`. All arguments are used as documented with those other commands.

Of course, once again, you can also manually set `$NODE_ENV`.

```bash
$ NODE_ENV=production un start
```

## API

### `configureWebpack(webpackConfig, loaderConfigs, target)` ([pipe](https://github.com/untool/mixinable/blob/master/README.md#definepipe))

If you implement this mixin hook in your `@untool/core` [`core` mixin](https://github.com/untool/untool/blob/master/packages/core/README.md#mixins), you will be able to modify the different Webpack configs `untool` uses in any way you like.

In addition to the actual `webpackConfig`, which, by the way, your implementation is expected to return, you will receive an array of all `loaderConfigs` and a `target` argument. This last argument can be `build`, `develop`, or `node`.

```javascript
const { Mixin } = require('@untool/core');

module.exports = class MyMixin extends Mixin {
  configureWebpack(webpackConfig, loaderConfigs, target) {
    return webpackConfig;
  }
};
```

You can use whatever mechanism you like to modify the complicated structures Webpack configs unfortunately have to be. We specifically recommend [`webpack-merge`](https://github.com/survivejs/webpack-merge) for non-trivial alterations.

### `inspectBuild(stats, config)` ([sequence](https://github.com/untool/mixinable/blob/master/README.md#defineparallel))

If you want to programmatically determine whether a build went well, your mixin can implement this method. It will be called with a Webpack [`stats`](https://webpack.js.org/api/node/#stats-object) object and the actual configuration used for the specific build you are inspecting.

### `build()` ([override](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

If you want to intialize a build of your application, you can do so using this utility mixin method. It returns a `Promise` resolving to a [`stats`](https://webpack.js.org/api/node/#stats-object) object.

### `clean()` ([override](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

Using this utility mixin method, you can delete your `buildDir` and all of its contents. It returns a `Promise`.

## Settings

| Property     | Type     | Default         |
| ------------ | -------- | --------------- |
| `browsers`   | `string` | `'defaults'`    |
| `node`       | `string` | `'current'`     |
| `serverFile` | `string` | `'server.js'`   |
| `assetFile`  | `string` | `'assets.json'` |

### `browsers`

This is a [`browserslist`](https://github.com/browserslist/browserslist) configuration that is being used in [CSS Next](http://cssnext.io) and Babel's [`preset-env`](https://babeljs.io/docs/plugins/preset-env/) to determine what language features need to be transpiled and/or polyfilled for your target platforms.

```json
{
  "browsers": "last 1 Chrome versions"
}
```

### `node`

This is the target Node.js version Babel's [`preset-env`](https://babeljs.io/docs/plugins/preset-env/) transpiles features for. Usually you will want to keep its default, as it is best practice to develop and build your application on the same Node version as you run in production.

```json
{
  "node": "8.10"
}
```

### `serverFile`

Path of your server output file, relative to [`buildDir`](https://github.com/untool/untool/blob/master/packages/express/README.md#builddir). It will only be generated in `production` and `static` modes and is being used internally.

```json
{
  "serverFile": "<namespace>/server.js"
}
```

### `assetFile`

Path of your assets manifest file, relative to [`buildDir`](https://github.com/untool/untool/blob/master/packages/express/README.md#builddir). It will only be generated in `production` and `no-static` modes and is being used internally.

```json
{
  "assetFile": "<namespace>/assets.json"
}
```
