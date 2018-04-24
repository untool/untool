# `@untool/yargs`

[![npm](https://img.shields.io/npm/v/@untool%2Fyargs.svg)](https://www.npmjs.com/package/@untool%2Fyargs)

`@untool/yargs` is a [core mixin](https://github.com/untool/untool/blob/master/packages/core/README.md#mixins) providing `untool`'s actual command line interface, allowing other mixins to define their own commands. These custom commands will work exactly as those defined by `untool`'s own modules and can be called using a local or global `un` executable.

### Installation

```bash
$ yarn add @untool/yargs # OR npm install @untool/yargs
```

## CLI

`@untool/yargs` can either be used with `untool`'s global [command line interface](https://github.com/untool/untool/blob/master/packages/cli/README.md) or directly, within `package.json` [scripts](https://docs.npmjs.com/cli/run-script) of the project it is installed in: it locally installs an `un` command.

```text
$ un
Usage: un <command> [options]

Commands:
  un serve    Serve foo
  un start    Build and serve foo
  un build    Build foo
  un develop  Serve foo in watch mode

Options:
  --version   Show version number                                     [boolean]
  --help, -h  Show help                                               [boolean]

$ un start
foo info
server listening at http://localhost:8080
```

`@untool/yargs` does not define any commands of its own, but takes care of basically setting up [`yargs`](http://yargs.js.org) and logging to [`stdout`](<https://en.wikipedia.org/wiki/Standard_streams#Standard_output_(stdout)>) and [`stderr`](<https://en.wikipedia.org/wiki/Standard_streams#Standard_error_(stderr)>). You can call `un` with an optional `-l` or `--log` command line argument with one of the following values to control its output: `debug`, `info`, `warn`, `error`, `silent`

## API

`@untool/yargs` exposes a couple of mixin hooks other mixins can implement, allowing them to alter or extend its functionality. These hooks will be called either by `@untool/yargs` itself or by others.

### `registerCommands(yargs, chalk)` ([pipe](https://github.com/untool/mixinable/blob/master/README.md#definepipe))

This is the most relevant hook provided by `@untool/yargs`: it enables other mixins to register their respective commands. Implementations of this mixin method will receive two arguments: a [`yargs`](http://yargs.js.org) instance and the command line arguments `@untool/yargs` received. Implementations need to return the `yargs` instance that they were called with.

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooMixin extends Mixin {
  registerCommands(yargs) {
    return yargs.command({
      command: 'foo',
      handler: argv => {},
    });
  }
};
```

### `log{Debug,Info,Warn,Error}(...args)` ([override](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

These are rather unusual mixin hooks, as they are basically utility methods that you can use in other mixins. They basically simply map to [`console.debug()`](https://nodejs.org/api/console.html#console_console_debug_data_args), [`console.info()`](https://nodejs.org/api/console.html#console_console_info_data_args), [`console.warn()`](https://nodejs.org/api/console.html#console_console_warn_data_args), [`console.error()`](https://nodejs.org/api/console.html#console_console_error_data_args).

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooMixin extends Mixin {
  foo() {
    this.logInfo('foo!');
  }
};
```

You can override the default implementation of these hooks by defining the appropriate methods in a custom `@untool/core` [`core` mixin](https://github.com/untool/untool/blob/master/packages/core/README.md#mixins).

### `logStats(stats)` ([override](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

This is yet another utility, aimed specifically at printing [Webpack stats](https://webpack.js.org/configuration/stats/). It receives a [`stats`](https://github.com/webpack/docs/wiki/node.js-api#stats) object and its output to `stdout` is considered `info`. It uses [`console.info()`](https://nodejs.org/api/console.html#console_console_info_data_args) under the hood.
