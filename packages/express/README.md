# `@untool/express`

[![npm](https://img.shields.io/npm/v/@untool%2Fexpress.svg)](https://www.npmjs.com/package/@untool%2Fexpress)

`@untool/express` provides both an `untool` [preset](https://github.com/untool/untool/blob/master/packages/core/README.md#presets) and a [mixin](https://github.com/untool/untool/blob/master/packages/core/README.md#mixins) to set up your project to work with [Express](https://expressjs.com).

It does not only provide full featured development and production mode servers, but also a mechanism for rendering static files using Express style middlewares without having to launch an actual server.

### Installation

```bash
$ yarn add @untool/express # OR npm install @untool/express
```

## CLI

### `serve`

`@untool/express` registers a single command using [`@untool/yargs`](https://github.com/untool/untool/blob/master/packages/yargs/README.md#registercommandsyargs-pipe): `serve`. As to be expected, this command launches a stand-alone Express server featuring [Helmet](https://helmetjs.github.io) and a [Express' static](https://expressjs.com/en/4x/api.html#express.static) file server middlewares.

```bash
$ un serve -ps
```

#### Arguments

##### `-p` / `--production`

If `un serve` is called with the `production` argument, `untool` itself sets the shell environment variable `$NODE_ENV` to `"production"`. This variable is generally used in lots of places, including [Express](https://expressjs.com/en/advanced/best-practice-performance.html) itself.

```bash
$ un serve -p # OR un serve --production
```

This is equivalent to manually setting `$NODE_ENV` before calling the actual command. Use whatever works best in your specific setting.

```bash
$ NODE_ENV=production un serve
```

## API

### `configureServer(app, middlewares, mode)` ([pipe](https://github.com/untool/mixinable/blob/master/README.md#definepipe))

This is a mixin hook defined by `@untool/express` that allows you to register Express middlewares and generally do whatever you like with `app`, the [`Application`](https://expressjs.com/en/api.html#app) instance it is using under the hood.

The second argument it is being called with is `middlewares`. It is a plain object containing middleware `Array`s sorted into phases: `initial`, `files`, `parse`, `routes`, and `final`. Additionally, each of these comes with `pre` and `post` variants.

Its third argument is `mode`, and it can be one of the following: `develop`, `serve`, or `static`. Use it to conditionally register middlewares or reconfigure the app.

```javascript
const { Mixin } = require('@untool/core');

module.exports = class MyMixin extends Mixin {
  configureServer(app, middlewares, mode) {
    middlewares.routes.push((req, res, next) => next());
    if (mode === 'serve') {
      middlewares.preinitial.unshift((req, res, next) => next());
      middlewares.postfinal.push((req, res, next) => next());
    }
    return app;
  }
};
```

Implement this hook in your `@untool/core` [`core` mixin](https://github.com/untool/untool/blob/master/packages/core/README.md#mixins) and you will be able to set up Express in any way you like.

### `inspectServer(app, target)` ([sequence](https://github.com/untool/mixinable/blob/master/README.md#defineparallel))

This hook will give you a running, i.e. listening, instance of [`http.Server`](https://nodejs.org/api/http.html#http_class_http_server) or [`https.Server`](https://nodejs.org/api/https.html#https_class_https_server), depending on your `https` setting. The second argument, `target`, will only ever be one of `develop` and `serve`. You can, for example, use this hook to register your server with an external load balancing system.

### `createServer(mode)` ([override](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

To create an Express app to use in your own server, you can use this utility mixin method. It uses `@untool/express`' [settings](https://github.com/untool/untool/blob/master/packages/express/README.md#settings) for its configuration. It accepts a string: `serve`, `develop` or `static`.

### `runServer(mode)` ([override](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

If you want to programmatically start a production ready Express server set up using `@untool/express`' [config](https://github.com/untool/untool/blob/master/packages/express/README.md#settings), you can use this utility mixin method. It accepts a string: `serve` or `develop`.

### `renderLocations()` ([override](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

With this method you can render HTML pages for all configured [`locations`](https://github.com/untool/untool/blob/master/packages/express/README.md#locations) using a simulated Express server configured using `@untool/express`' [settings](https://github.com/untool/untool/blob/master/packages/express/README.md#settings). This method returns a `Promise` resolving to a hash containing the rendered paths.

## Settings

`@untool/express` defines a couple of settings as a preset for `@untool/core`'s [configuration engine](https://github.com/untool/untool/blob/master/packages/core/README.md#configuration). You can manage and access them using the mechanisms outlined there.

| Property    | Type               | Default            |
| ----------- | ------------------ | ------------------ |
| `https`     | `boolean`/`Object` | `false`            |
| `host`      | `string`           | `[HOST]`           |
| `port`      | `number`           | `[PORT]`           |
| `locations` | `[string]`         | `[]`               |
| `basePath`  | `string`           | `''`               |
| `assetPath` | `string`           | `'<basePath>'`     |
| `buildDir`  | `string`           | `'<rootDir>/dist'` |

### `https`

`@untool/express` fully supports HTTPS and using this key, you can configure its SSL/TLS mode. You can either set it to `true` to enable SSL with the included insecure certificate. Or you can tell it to use a [proper](https://letsencrypt.org) SSL certificate.

```json
{
  "https": true,
  "env": {
    "production": {
      "https": {
        "keyFile": "./ssl/foo.key",
        "certFile": "./ssl/foo.cert"
      }
    }
  }
}
```

### `host`

The [hostname](https://en.wikipedia.org/wiki/Hostname) to bind the server to is, of course, configurable. By default, `@untool/express` tries to read an environment variable named `$HOST` and falls back to [`'0.0.0.0'`](https://en.wikipedia.org/wiki/0.0.0.0).

```json
{
  "host": "10.10.10.10"
}
```

### `port`

The [TCP port](https://en.wikipedia.org/wiki/Transmission_Control_Protocol#TCP_ports) the server will be listening on can be configured, too. By default, `@untool/express` tries to read an environment variable named `$PORT` and falls back to a dynamically chosen free port (>=8080).

```json
{
  "port": 3000
}
```

### `locations`

Using this setting, you can define the locations used for prerendering of static HTML pages at build time. Simply list all URL paths you want to prerender and call `un build -ps`.

```json
{
  "locations": ["/foo", "/bar"]
}
```

### `basePath`

This is the URL base path, i.e. subfolder, your application will be served from.

```json
{
  "basePath": "<name>"
}
```

### `assetPath`

This is the URL base path, i.e. subfolder, your application's assets will be served from.

```json
{
  "assetPath": "<basePath>/assets"
}
```

### `buildDir`

This is the file system path, i.e. subfolder, your application's assets will be served from.

```json
{
  "buildDir": "<rootDir>/build"
}
```
