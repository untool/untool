# `@untool/webpack`

[![travis](https://img.shields.io/travis/untool/untool/master.svg)](https://travis-ci.org/untool/untool)&nbsp;[![npm](https://img.shields.io/npm/v/@untool%2Fwebpack.svg)](https://www.npmjs.com/package/@untool/webpack)

`@untool/webpack` is the largest and most complex of `untool`'s core packages. It contains half of its total lines of code and provides both a [preset](https://github.com/untool/untool/blob/master/packages/core/README.md#presets) and a [core mixin](https://github.com/untool/untool/blob/master/packages/core/README.md#mixins). It provides a comprehensive, but rather minimal [`Webpack`](https://webpack.js.org) setup as a basis for your own configurations.

Based on [`@untool/express`](https://github.com/untool/untool/blob/master/packages/express/README.md), it also features development and production servers. The former even comes with [hot module replacement (HMR)](https://webpack.js.org/concepts/hot-module-replacement/).

During application startup, `@untool/webpack` runs a check to determine if Webpack is installed multiple times. If you see warnings telling you that this is the case, you will want to make sure you get rid of these duplicates, as they will almost certainly break things in interesting ways.

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

##### `-s` / `--static` (**deprecated**)

In `static` mode, static HTML pages will be generated for the [`locations`](https://github.com/untool/untool/blob/master/packages/express/README.md#locations) configured for your application. In `no-static` mode, `server.js` and `stats.json` files will be created instead.

**Note**: Static rendering is deprecated and will be removed in a future major release.

### `develop`

Using this command, you can start a full-featured development server that is as similar to a production system as possible. It does, however, ensure the browser and server versions of your application are being recompiled and redeployed whenever you change your code.

```bash
$ un develop
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

##### `-s` / `--static`

In `static` mode, static HTML pages will be generated for the [`locations`](https://github.com/untool/untool/blob/master/packages/express/README.md#locations) configured for your application.

## API

`@untool/webpack` provides a couple of configurable exports for your convenience: mixin hooks marked with 'callable' below can be called like in the following example example:

```javascript
const { build } = require('@untool/webpack');
build();
```

If you need to provide config overrides or options to these kinds of calls, you can do so like in the next example.

```javascript
const { configure } = require('@untool/webpack');
const { build } = configure(configOverrides, options);
build();
```

The above example is functionally equivalent to directly working with `@untool/core`'s [`bootstrap`](https://github.com/untool/untool/blob/master/packages/core/README.md#bootstrapconfigoverrides-options-build-only) export.

### `configureBuild(webpackConfig, loaderConfigs, target)` ([sequence](https://github.com/untool/mixinable/blob/master/README.md#defineparallel))

If you implement this mixin hook in your `@untool/core` [`core` mixin](https://github.com/untool/untool/blob/master/packages/core/README.md#mixins), you will be able to modify the different Webpack configs `untool` uses in any way you like.

In addition to the actual `webpackConfig`, which, by the way, your implementation is expected to return, you will receive an object containing all `loaderConfigs` and a `target` argument. This last argument can be `build`, `develop`, or `node`.

```javascript
const { Mixin } = require('@untool/core');

module.exports = class MyMixin extends Mixin {
  configureBuild(webpackConfig, loaderConfigs, target) {
    webpackConfig.resolve.extensions.push('.ftw');
  }
};
```

You can use whatever mechanism you like to modify the complicated structures Webpack configs unfortunately have to be. For convenience, `loaderConfigs` contains the following properties for you to inspect and modify specific loader configs directly:

| Property           | Explanation                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `jsLoaderConfig`   | [`babel-loader` config](https://github.com/babel/babel-loader)                                                            |
| `urlLoaderConfig`  | [`url-loader` config](https://github.com/webpack-contrib/url-loader)                                                      |
| `fileLoaderConfig` | [`file-loader` config](https://github.com/webpack-contrib/file-loader)                                                    |
| `allLoaderConfigs` | `Array` of loader configs passed to [`oneOf` module loader rule](https://webpack.js.org/configuration/module/#rule-oneof) |

**Caveat**: please be advised that, while we strive to provide very stable `webpackConfig` and `loaderConfigs` arguments, these may change in subtle ways between `minor` versions of `@untool/webpack`. For example, specific loader options may stop working. Additionally, other mixins may alter these arguments in relevant ways, so code accordingly.

### `inspectBuild(stats, config)` ([sequence](https://github.com/untool/mixinable/blob/master/README.md#defineparallel))

If you want to programmatically determine whether a build went well, your mixin can implement this method. It will be called with a Webpack [`stats`](https://webpack.js.org/api/node/#stats-object) object and the actual configuration used for the specific build you are inspecting.

### `build()` ([callable](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

If you want to intialize a build of your application, you can do so using this utility mixin method. It returns a `Promise` resolving to a [`stats`](https://webpack.js.org/api/node/#stats-object) object.

_This method is also exported so that you can use it in your own, non-mixin code. Import it like so: `import { build } from '@untool/webpack';`. In this mode, it also accepts another argument, `options`, which you can pass any CLI argument to._

### `clean()` ([callable](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

Using this utility mixin method, you can delete your `buildDir` and all of its contents. It returns a `Promise`.

_This method is also exported so that you can use it in your own, non-mixin code. Import it like so: `import { clean } from '@untool/webpack';`. In this mode, it also accepts another argument, `options`, which you can pass any CLI argument to._

### `getWebpackBuildConfig(target)` ([callable](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

Returns the webpack config for the production build after `configureBuild` has been applied. `target` argument can be `browser` or `none` and will determine which mixins should be bundled.

_This method is also exported so that you can use it in your own, non-mixin code. Import it like so: `import { getWebpackBuildConfig } from '@untool/webpack';`. In this mode, it also accepts another argument, `options`, which you can pass any CLI argument to._

### `getWebpackDevelopConfig(target)` ([callable](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

Returns the webpack config for the development build after `configureBuild` has been applied. `target` argument can be `browser` or `none` and will determine which mixins should be bundled.

_This method is also exported so that you can use it in your own, non-mixin code. Import it like so: `import { getWebpackDevelopConfig } from '@untool/webpack';`. In this mode, it also accepts another argument, `options`, which you can pass any CLI argument to._

### `getWebpackNodeConfig(target)` ([callable](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

Returns the webpack config for the server-side Node.js build after `configureBuild` has been applied. `target` argument can be `server` or `none` and will determine which mixins should be bundled.

_This method is also exported so that you can use it in your own, non-mixin code. Import it like so: `import { getWebpackNodeConfig } from '@untool/webpack';`. In this mode, it also accepts another argument, `options`, which you can pass any CLI argument to._

## Settings

| Property     | Type       | Default                                  |
| ------------ | ---------- | ---------------------------------------- |
| `browsers`   | `[string]` | `['defaults']`                           |
| `node`       | `string`   | `'current'`                              |
| `locations`  | `[string]` | `[]`                                     |
| `basePath`   | `string`   | `''`                                     |
| `assetPath`  | `string`   | `'<basePath>'`                           |
| `buildDir`   | `string`   | `'<distDir>'`                            |
| `serverDir`  | `string`   | `'<rootDir>/node_modules/.cache/untool'` |
| `serverFile` | `string`   | `'server.js'`                            |
| `statsFile`  | `string`   | `'stats.json'`                           |

### `browsers`

This is a [`browserslist`](https://github.com/browserslist/browserslist) configuration that is being used and Babel's [`preset-env`](https://babeljs.io/docs/plugins/preset-env/) to determine what language features need to be transpiled and/or polyfilled for your target platforms.

```json
{
  "browsers": ["last 1 Chrome versions"]
}
```

### `node`

This is the target Node.js version Babel's [`preset-env`](https://babeljs.io/docs/plugins/preset-env/) transpiles features for. Usually you will want to keep its default, as it is best practice to develop and build your application on the same Node version as you run in production.

```json
{
  "node": "8.10"
}
```

### `locations`

Using this setting, you can define the locations used for prerendering of static HTML pages at build time. Simply list all URL paths you want to prerender and perform a build in static mode, e.g. by running `un build -ps`.

Locations are treated as relative to your configured `basePath`: you will not have to add it as a prefix to your `locations` yourself.

```json
{
  "locations": ["/foo", "/bar"]
}
```

### `basePath`

This is the URL base path, i.e. subfolder, your application will be served from. If set, this folder will be created in your `buildDir` during static builds.

```json
{
  "basePath": "<name>"
}
```

### `assetPath`

This is the URL base path, i.e. subfolder, your application's assets will be served from. If set, this folder will be created in your `buildDir` at build time.

```json
{
  "assetPath": "<basePath>/assets"
}
```

### `buildDir`

Path of your browser build output. By default, this folder is usually removed before building. Make sure the contents of this folder can be served by your webserver.

```json
{
  "buildDir": "<rootDir>/build"
}
```

### `serverDir`

Path of your server build output. It will only be used in `production`, non-`static` mode. By default, this folder is located inside your `node_modules` folder and it is usually removed before building.

```json
{
  "serverDir": "<buildDir>"
}
```

### `serverFile`

Path of your server output file, relative to [`serverDir`](https://github.com/untool/untool/blob/master/packages/webpack/README.md#serverdir). It will only be generated in `production`, non-`static` mode and is being used internally.

```json
{
  "serverFile": "server.js"
}
```

### `statsFile`

Path of your stats file, relative to [`serverDir`](https://github.com/untool/untool/blob/master/packages/webpack/README.md#serverdir). It will only be generated in `production`, non-`static` mode and is being used internally.

```json
{
  "assetFile": "stats.json"
}
```
