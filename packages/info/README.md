# `@untool/info`

[![travis](https://img.shields.io/travis/untool/untool/master.svg)](https://travis-ci.org/untool/untool)&nbsp;[![npm](https://img.shields.io/npm/v/@untool%2Finfo.svg)](https://www.npmjs.com/package/@untool/info)

`@untool/info` is a [core mixin](../core/README.md#mixins) providing output for `untool`'s command line interface. Besides that, it allows other mixins to define pre-flight checks that are run during application startup.

### Installation

```bash
$ yarn add @untool/info # OR npm install @untool/info
```

## CLI

`@untool/info` does not define any commands of its own, but only adds some global CLI flags to control console output. Using the flags `-v`/`--verbose` and `-q`/`--quiet` once or multiple times, you can de- and increase the log output. Default log level is `info`, passing a single `-q` will reduce it to `warning` while a single `-v` will bump it to `verbose`. Passing `-qqq` will silence all output completely.

#### Log Levels

```text
{
  error: 0,
  warning: 1,
  info: 2,
  verbose: 3,
}
```

Additionally, you can pass `--color`/`--no-color` flags to manually enable or disable [output colors](https://github.com/chalk/chalk#chalksupportscolor), but you can usually rely on `@untool/info` to determine color support automatically.

```bash
$ un start -v --no-color
```

## API

`@untool/info` exposes a couple of utility mixin hooks other mixins can implement.

### `getLogger()` ([callable](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

This utility hook defined by `@untool/info` provides other mixins with a fully configured logger instance. This logger has three standard log methods (`info`, `warning` and `error`) that correspond to the lower three log levels described above. Additionally, it supports arbitrary log methods (e.g. `request`, `hint`, `foo`)

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooMixin extends Mixin {
  bar() {
    if (typeof this.getLogger === 'function') {
      const logger = this.getLogger();
      logger.info('this will log an info message');
      logger.warning('this will log a warning message');
      logger.error('this will log an error message');
      logger.baz('this will log a verbose message');
      logger.qux('this will log a verbose message, too');
    }
  }
};
```

### `diagnose(doctor)` ([parallel](https://github.com/untool/mixinable/blob/master/README.md#defineparallel))

By implementing this method, your core mixin can perform pre-flight checks during application startup and return an array of warnings. If you need to do something asynchronous at this point, just return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooMixin extends Mixin {
  diagnose(doctor) {
    doctor.diagnoseDuplicatePackages('bar');
    if (1 + 1 !== 2) {
      return ['Math is broken.'];
    }
  }
};
```

Additionally, you can use the helper methods defined on our semi-private [doctor](../info/lib/doctor.js) object that is being passed into this hook.
