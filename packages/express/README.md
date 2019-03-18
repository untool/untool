# `@untool/express`

[![travis](https://img.shields.io/travis/untool/untool/master.svg)](https://travis-ci.org/untool/untool)&nbsp;[![npm](https://img.shields.io/npm/v/@untool%2Fexpress.svg)](https://www.npmjs.com/package/@untool/express)

`@untool/express` provides both an `untool` [preset](https://github.com/untool/untool/blob/master/packages/core/README.md#presets) and a [mixin](https://github.com/untool/untool/blob/master/packages/core/README.md#mixins) to set up your project to work with [Express](https://expressjs.com).

It does not only provide full featured development and production mode servers, but also a mechanism for rendering static files using Express style middlewares without having to launch an actual server.

`@untool/express` strives to gracefully handle exceptions and to facilitate infrastructure integration: in case of uncaught middleware errors or upon receiving a [`SIGTERM`](https://www.gnu.org/software/libc/manual/html_node/Termination-Signals.html) signal, the server's [`close`](https://nodejs.org/api/net.html#net_server_close_callback) method will be called before exiting the process.

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

`@untool/express` provides a couple of configurable exports for your convenience: mixin hooks marked with 'callable' below can be called like in the following example example:

```javascript
const { runServer } = require('@untool/express');
runServer();
```

If you need to provide config overrides or options to these kinds of calls, you can do so like in the next example.

```javascript
const { configure } = require('@untool/express');
const { runServer } = configure(configOverrides, options);
runServer();
```

The above example is functionally equivalent to directly working with `@untool/core`'s [`bootstrap`](https://github.com/untool/untool/blob/master/packages/core/README.md#bootstrapconfigoverrides-options-build-only) export.

### `configureServer(app, middlewares, mode)` ([sequence](https://github.com/untool/mixinable/blob/master/README.md#defineparallel))

This is a mixin hook defined by `@untool/express` that allows you to register Express middlewares or route handlers and generally do whatever you like with `app`, the [`Application`](https://expressjs.com/en/api.html#app) instance it is using under the hood.

The second argument it is being called with is `middlewares`. It is a plain object containing middleware `Array`s sorted into phases: `initial`, `files`, `parse`, `routes`, and `final`. Additionally, each of these comes with `pre` and `post` variants. Use these phases-arrays to declaratively add middlewares and route handlers to our server.

Its third argument is `mode`, and it can be one of the following: `develop`, `serve`, or `static`. Use it to conditionally register middlewares or reconfigure the app.

```javascript
const { Mixin } = require('@untool/core');

module.exports = class MyMixin extends Mixin {
  configureServer(app, middlewares, mode) {
    middlewares.routes.push((req, res, next) => next());
    if (mode === 'serve') {
      middlewares.preinitial.unshift((req, res, next) => next());
      middlewares.postfinal.push({
        path: '/foo',
        method: 'get',
        handler: (req, res, next) => next(),
      });
    }
    return app;
  }
};
```

Implement this hook in your `@untool/core` [`core` mixin](https://github.com/untool/untool/blob/master/packages/core/README.md#mixins) and you will be able to set up Express in any way you like.

**Caveat**: please do not rely on the exact number and order of middlewares and handlers passed to your mixin in the `middlewares` argument: it is highly dynamic and can be altered by other mixins (or configs). It can also change between `@untool/express` versions without triggering a `major` release.

### `inspectServer(server)` ([sequence](https://github.com/untool/mixinable/blob/master/README.md#defineparallel))

This hook will give you a running, i.e. listening, instance of [`http.Server`](https://nodejs.org/api/http.html#http_class_http_server) or [`https.Server`](https://nodejs.org/api/https.html#https_class_https_server), depending on your `https` setting. This server will emit an additional `shutdown` event in case a graceful shutdown is triggered.

### `runServer(mode)` ([callable](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

If you want to programmatically start a production ready Express server set up using `@untool/express`' [config](https://github.com/untool/untool/blob/master/packages/express/README.md#settings), you can use this utility mixin method. It accepts a string: `serve` or `develop`.

_This method is also exported so that you can use it in your own, non-mixin code. Import it like so: `import { runServer } from '@untool/express';`. In this mode, it also accepts another argument, `options`, which you can pass any CLI argument to._

### `createServer(mode)` ([callable](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

To create an Express app to use in your own server, you can use this utility mixin method. It uses `@untool/express`' [settings](https://github.com/untool/untool/blob/master/packages/express/README.md#settings) for its configuration. It accepts a string: `serve`, `develop` or `static`.

_This method is also exported so that you can use it in your own, non-mixin code. Import it like so: `import { createServer } from '@untool/express';`. In this mode, it also accepts another argument, `options`, which you can pass any CLI argument to._

### `createRenderer()` ([callable](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

If you need a fully configured render function like the one used in `renderLocations()` (see below), you can call this utility mixin method.

_This method is also exported so that you can use it in your own, non-mixin code. Import it like so: `import { createRenderer } from '@untool/express';`. In this mode, it also accepts another argument, `options`, which you can pass any CLI argument to._

## Settings

`@untool/express` defines a couple of settings as a preset for `@untool/core`'s [configuration engine](https://github.com/untool/untool/blob/master/packages/core/README.md#configuration). You can manage and access them using the mechanisms outlined there.

| Property      | Type               | Default            |
| ------------- | ------------------ | ------------------ |
| `https`       | `boolean`/`Object` | `false`            |
| `host`        | `string`           | `[HOST]`           |
| `port`        | `number`           | `[PORT]`           |
| `distDir`     | `string`           | `'<rootDir>/dist'` |
| `gracePeriod` | `number`           | `30000`            |

### `https`

`@untool/express` fully supports HTTPS and using this key, you can configure its SSL/TLS mode. You can either set it to `true` to enable SSL with the included insecure certificate. Or you can tell it to use a [proper](https://letsencrypt.org) SSL certificate.

```json
{
  "https": {
    "keyFile": "./ssl/foo.key",
    "certFile": "./ssl/foo.cert"
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

### `distDir`

This is the file system path, i.e. subfolder, your application's assets will be served from.

```json
{
  "distDir": "<rootDir>/build"
}
```

### `gracePeriod`

The amount of time (in milliseconds) to wait after receiving a [`SIGTERM`](https://www.gnu.org/software/libc/manual/html_node/Termination-Signals.html) signal or catching an unhandled middleware exception and before killing the server completely.

```json
{
  "gracePeriod": 60000
}
```
