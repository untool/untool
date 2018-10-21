# `untool`

[![travis](https://img.shields.io/travis/untool/untool/master.svg)](https://travis-ci.org/untool/untool)&nbsp;[![npm](https://img.shields.io/npm/v/untool.svg)](https://www.npmjs.com/package/untool)

This package is an (optional) consolidated entry point to all other `@untool/*` packages. It does not contain any meaningful code of its own, but you can use it to access our entire code base.

Please refer to the respective packages for further information:

- [`@untool/core`](https://github.com/untool/untool/blob/master/packages/core/README.md): central base module all other packages rely upon
- [`@untool/yargs`](https://github.com/untool/untool/blob/master/packages/yargs/README.md): command line interface engine
- [`@untool/express`](https://github.com/untool/untool/blob/master/packages/express/README.md): development and production server implementation
- [`@untool/webpack`](https://github.com/untool/untool/blob/master/packages/webpack/README.md): webpack setup (including Babel)
- [`@untool/react`](https://github.com/untool/untool/blob/master/packages/react/README.md): universal React implementation

### Installation

```bash
$ yarn add untool # OR npm install untool
```

## CLI

`untool` installs an executable called `un` in your project, allowing you to use it in your `package.json` scripts or simply with yarn:

```text
$ yarn exec un start
```

## API

### Runtime

`untool` re-exports everything that [`@untool/core`](https://github.com/untool/untool/blob/master/packages/core/README.md) and [`@untool/react`](https://github.com/untool/untool/blob/master/packages/react/README.md) provide, meaning you can simply use it like this in your runtime code:

```javascript
import { render, Import } from 'untool';
```

### Core

`untool` re-exports everything that [`@untool/core`](https://github.com/untool/untool/blob/master/packages/core/README.md), [`@untool/yargs`](https://github.com/untool/untool/blob/master/packages/yargs/README.md), [`@untool/express`](https://github.com/untool/untool/blob/master/packages/express/README.md), [`@untool/webpack`](https://github.com/untool/untool/blob/master/packages/webpack/README.md) and [`@untool/react`](https://github.com/untool/untool/blob/master/packages/react/README.md) provide. Use it in your Node.js code like this:

```javascript
const { Mixin } = require('untool');
```

## Settings

As `untool` aggrgates all other `@untool` packages it includes all settings these provide.
