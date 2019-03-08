# `@untool/yargs`

[![travis](https://img.shields.io/travis/untool/untool/master.svg)](https://travis-ci.org/untool/untool)&nbsp;[![npm](https://img.shields.io/npm/v/@untool%2Fyargs.svg)](https://www.npmjs.com/package/@untool%2Fyargs)

`@untool/yargs` is a [core mixin](https://github.com/untool/untool/blob/master/packages/core/README.md#mixins) powering `untool`'s command line interface and allowing other mixins to define their own commands. These custom commands will work exactly as those defined by `untool`'s own modules and can be called using executables such as [Hops CLI](https://github.com/xing/hops/blob/master/packages/cli/README.md).

`@untool/yargs` runs a check to determine if any `@untool` npm packages are installed multiple times. If you see warnings telling you that this is the case, you will want to make sure you get rid of these duplicates, as they will almost certainly break things in interesting ways.

Additionally, `@untool/yargs` helps validate your config. If you see warnings regarding your config, you will almost certainly want to resolve them.

### Installation

```bash
$ yarn add @untool/yargs # OR npm install @untool/yargs
```

## CLI

`@untool/yargs` does not define any commands of its own, but only takes care of basically setting up [`yargs`](http://yargs.js.org).

`@untool/yargs` provides a basic command line interface you can use to control your application. It is called `un` - and it is best used inside your `package.json` scripts section.

```json
{
  "scripts": {
    "start": "un start"
  }
}
```

Alternatively, you can call it directly inside your project using `npx` or `yarn exec`. Call it without any command to see the available commands and options.

```bash
$ yarn exec un start # OR npx un start
```

## API

`@untool/yargs` only has a couple of semi-private exports, but it exposes a couple of mixin hooks other mixins can implement, allowing them to alter or extend its functionality. These hooks will be called either by `@untool/yargs` itself or by others.

### `bootstrap()` ([parallel](https://github.com/untool/mixinable/blob/master/README.md#defineparallel))

Within this method, you are expected to set up your application. If you need to do something asynchronous at this point, just return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooMixin extends Mixin {
  bootstrap(yargs) {
    return Promise.resolve();
  }
};
```

### `registerCommands(yargs)` ([sequence](https://github.com/untool/mixinable/blob/master/README.md#defineparallel))

This is the most relevant hook provided by `@untool/yargs`: it enables other mixins to register their respective commands. Implementations of this mixin method will receive a single argument: a [`yargs`](http://yargs.js.org) instance.

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooMixin extends Mixin {
  registerCommands(yargs) {
    yargs.command(
      this.configureCommand({
        command: 'foo',
        builder: {},
        handler: (argv) => {},
      })
    );
  }
};
```

### `configureCommand(definition)` ([sequence](https://github.com/untool/mixinable/blob/master/README.md#defineparallel))

By implementing this method, your mixin can intercept and alter command configuration. Its main purpose is to enable you to add arguments to commands defined by other mixins.

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooBarMixin extends Mixin {
  configureCommand(definition) {
    if (definition.command === 'foo') {
      definition.builder.bar = {
        alias: 'b',
        default: false,
        describe: 'Enable bar',
        type: 'boolean',
      };
    }
  }
};
```

**Caveat**: please be advised that, while we strive to keep the `definition` argument very stable, it may change between `minor` versions of `@untool/*` packages that provide commands. Additionally, other mixins may alter the command you want to modify in relevant ways, so code accordingly.

### `handleArguments(argv)` ([sequence](https://github.com/untool/mixinable/blob/master/README.md#defineparallel))

Your mixin's implementation of this method will receive the parsed CLI arguments passed to `@untool/yargs`. You may want to implement it if you need to alter mixin behaviour according to these args.

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooMixin extends Mixin {
  handleArguments(argv) {
    this.options = { ...this.options, ...argv };
  }
};
```

### `handleError(error, recoverable)` ([override](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

By implementing this method, you can handle exceptions occuring in your application - even uncaught errors and unhandled promise rejections. **If `receoverable' is 'false`, `@untool/yargs` will automatically terminate the [running process](https://nodejs.org/api/process.html#process_warning_using_uncaughtexception_correctly).**

```javascript
const { Mixin } = require('@untool/core');
const { logError } = require('./logger');

module.exports = class FooMixin extends Mixin {
  handleError(error, recoverable) {
    logError(error);
  }
};
```

### `runChecks()` ([parallel](https://github.com/untool/mixinable/blob/master/README.md#defineparallel))

By implementing this method, you can validate the setup of your application during startup. You can run arbitrary checks in here and are expected to return an array of warnings. If you need to do something asynchronous in this method, just return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooMixin extends Mixin {
  runChecks(yargs) {
    return new Promise((resolve) => {
      1 + 1 === 2 ? resolve([]) : resolve(['Math is broken']);
    });
  }
};
```

By default, these warnings are not being dealt with at all. If you, for example, want them to be printed out during app startup, you will have to make sure the `inspectWarnings` hook is also implemented (see below). In apps using the `untool` package directly, this is done by relying on the optional mixin `@untool/yargs/mixins/log`.

### `inspectWarnings(warnings)` ([sequence](https://github.com/untool/mixinable/blob/master/README.md#defineparallel))

By implementing this method, you can deal with warnings produced using `runChecks` hooks implemented elsewhere in your application (see above). In apps using the `untool` package directly, this is taken care of by the optional mixin `@untool/yargs/mixins/log`.

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooMixin extends Mixin {
  inspectWarnings(warnings) {
    warnings.forEach((warning) => console.warn(warning));
  }
};
```
