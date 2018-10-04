# `@untool/yargs`

[![npm](https://img.shields.io/npm/v/@untool%2Fyargs.svg)](https://www.npmjs.com/package/@untool%2Fyargs)

`@untool/yargs` is a [core mixin](https://github.com/untool/untool/blob/master/packages/core/README.md#mixins) powering `untool`'s command line interface and allowing other mixins to define their own commands. These custom commands will work exactly as those defined by `untool`'s own modules and can be called using executables such as [Hops CLI](https://github.com/xing/hops/blob/master/packages/cli/README.md).

### Installation

```bash
$ yarn add @untool/yargs # OR npm install @untool/yargs
```

## CLI

`@untool/yargs` does not define any commands of its own, but only takes care of basically setting up [`yargs`](http://yargs.js.org).

## API

`@untool/yargs` only has a couple of semi-private exports, but it exposes a couple of mixin hooks other mixins can implement, allowing them to alter or extend its functionality. These hooks will be called either by `@untool/yargs` itself or by others.

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

By implemention this method, your mixin can intercept and alter command configuration. Its main purpose is to enable you to add arguments to commands defined by other mixins.

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooBarMixin extends Mixin {
  configureCommand(definition) {
    if (definition.command === 'foo') {
      command.builder.bar = {
        alias: 'b',
        default: false,
        describe: 'Enable bar',
        type: 'boolean',
      };
    }
  }
};
```

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

### `handleError(error)` ([override](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

By implementing this method, you can intercept uncaught errors and unhandled promise rejections. **Make sure you terminate the process in which this method is being called.**

```javascript
const { Mixin } = require('@untool/core');
const { logError } = require('./logger');

module.exports = class FooMixin extends Mixin {
  handleError(error) {
    logError(error).then(() => process.exit(1));
  }
};
```
