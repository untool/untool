# `@untool/core`

[![npm](https://img.shields.io/npm/v/@untool%2Fcore.svg)](https://www.npmjs.com/package/@untool%2Fcore)

`@untool/core` is the functional foundation every other `untool` component is built upon. It contains a comprehensive configuration engine and a set of mixin base classes.

### Installation

```bash
$ yarn add @untool/core # OR npm install @untool/core
```

## Configuration

Apart from a couple of some very basic properties (`namespace`, `version` and `rootDir`), `@untool/core` does not provide configuration of its own. It does, however, provide an elaborate configuration mechanism.

It allows you to set up mixins and pull in presets. Mixins provide extra functionality. Presets provide configuration defaults and often additionally include custom mixins. Read more about mixins and presets below.

```json
{
  "mixins": ["@untool/yargs"],
  "presets": ["@untool/express"]
}
```

`@untool/core` comes with support for environment specific configuration. For example, you can pin [`@untool/express`](https://github.com/untool/untool/blob/master/packages/express/README.md)'s port to a specific value in production and have it search for a free port in develoment and test environments.

```json
{
  "port": null,
  "env": {
    "production": {
      "port": 12345
    }
  }
}
```

You can even use placeholders everywhere throughout your configuration. Nested configuration structures will be flattened before being used for placeholder substitution.

```json
{
  "foo": "foo",
  "bar": {
    "baz": "<foo>"
  },
  "qux": "<bar.baz>"
}
```

`@untool/core` looks for configuration data in rather many places. It only uses the first config it finds, so make sure you do not have multiple configs lying around:

* an `untool` property in your project's `package.json` file
* an `.untoolrc` file in your project's root folder (JSON, YAML, or JS)
* an `.untoolrc.{json,yaml,yml,js}` file in your project's root folder
* an `untool.config.js` file in your project's root folder

We strongly encourage organizing and publishing reusable bits of configuration as custom presets. You can even use any other `untool` project as a preset: just install it (e.g. `yarn add <git remote url>`) and add it to the `presets` section in your project's `untool` configuration.

### Presets

`untool` presets are JavaScript files or standard NPM modules. Presets can define or override arbitrary configuration properties, including mixins and other presets.

Just as with your own project, presets can be written using JavaScript, JSON or YAML syntax. They are plain nested objects (or hashes) and they fully support the features outlined above: placeholders and environment specificity.

##### JavaScript preset

```javascript
module.exports = {
  foo: 'bar',
  baz: {
    quux: [23],
  },
};
```

##### JSON preset

```json
{
  "foo": "bar",
  "baz": {
    "quux": [23]
  }
}
```

##### YAML preset

```yaml
foo: bar
baz:
  quux:
    - 23
```

In preset packages, `@untool/core` will try to load a config from the same places as in your project and in addition, it will look in two more places:

* a file defined in the `preset` property in the preset's `package.json` file
* a `preset.js` file in the preset package's root folder

If you want to not only override and extend config values, but rather provide actual features, you can include custom mixins directly in your preset. Some of `untool`'s default presets do just that.

### Mixins

Mixins are the primary mechanism in `untool` to extend and alter its features and behaviour. Using mixins, you can, for example, add your own Yargs commands, Express middlewares or React add-ons such as Redux.

You can even build custom mixins that provide hooks for others to tap into, extending and altering their capabilities. There are three distinct types of mixins that are supported in `untool`: `core`, `browser` and `server`.

`untool` uses a single config key for all three kinds of mixins: `mixins`. It expects an array of module path strings. `@untool/core` looks for mixins in the following places beneath those module paths:

* a file defined in the `mixin:{core,server,browser}` property in the preset's `package.json` file
* a file defined in the `mixin:runtime` property in the preset's `package.json` file (for `server`+`browser`)
* a file defined in the `mixin` property in the preset's `package.json` file (for `core`+`server`+`browser`)
* a `mixin.{core,server,browser}.js` file in the preset package's root folder
* a `mixin.runtime.js` file in the preset package's root folder (for `server`+`browser`)
* a `mixin.js` file in the preset package's root folder (for `core`+`server`+`browser`)

By using this mechanism, you can use a single NPM module to provide all three types of mixins, one mixin each for build and runtime or even a single mixin used for all contexts.

Every and all functionality in and around `untool` is expected to be organized in mixins. In `untool`, mixins are a bit special: they do not share state, i.e. they do not provide methods to a single 'host' object.

Instead, they are based on a library called [`mixinable`](https://github.com/untool/mixinable). Their methods are, therefore, applied according to specific strategies: `override`, `parallel`, `sequence`, and `pipe` are some examples.

If you create custom mixins that define additional mixin strategies, you probably want to call the appropriate methods yourself to allow others to, for example, modify your mixin's specific config.

## API

### `Mixin(core, config, [...args])`

```javascript
import { Mixin } from '@untool/core';

class MyMixin extends Mixin {
  myMethod() {}
}

export default MyMixin;
```

`Mixin` is a base class to build custom mixins upon. As such, it only provides a class constructor that accepts and handles a couple of arguments. You do not, however, usually instantiate your mixins - `@untool/core` does that for you if configured to use them.

The `Mixin` constructor expects at least two arguments: `core`, a proxy object mimicking the mixin container and thus allowing you to call all defined mixin methods and `config`, the main configuration object. Both arguments are made available as homonymous instance properties.

```javascript
import { override } from 'mixinable';
import { Mixin } from '@untool/core';

class MyMixin extends Mixin {
  constructor(core, config, ...args) {
    super(core, config, ...args);
  }
  myMethod(...args) {
    const { myHookMethod } = this.core;
    return myHookMethod(...args);
  }
}

MyMixin.strategies = {
  myHookMethod: override,
};

export default MyMixin;
```

If inheriting from `Mixin`, all methods of your mixin are automatically bound to the repective instance, so you do not have to call `this.method.bind(this)` yourself even if you use them in asynchronous contexts.

Note that you cannot call any of the methods of the core object from inside your mixin's custom `constructor` function: they only become available after all mixins have been instantiated.

### `render([...args])` (runtime only)

This function, that you are expected to call in your applications main entry file, is essentialy a shorthand: it creates and bootstraps a core mixin container and calls its `render` method.

Whatever arguments it receives are being passed along to its container's mixins' constructors. For it to work, you need to register at least one mixin implementing the `render` method. The default render mixin is [`@untool/react`](https://github.com/untool/untool/blob/master/packages/react/README.md).

Render mixins are expected to return functions from their render implementations: an [Express middleware](https://expressjs.com/en/guide/using-middleware.html) on the server or a function that bootstraps and starts a client side app in the browser.

```javascript
import React from 'react';
import { render } from '@untool/core';
export default render(<h1>hello world</h1>);
```

The render function serves two main purposes: 'universalifying' or 'isomorphizing' you application, i.e. making sure your app's code can run both on a server and in a browser, and integrating `untool`'s build and runtime environments.

`Mixin` aside, `render` probably is the only part of `untool` you will directly interact with in your own code. It certainly is the only one of its APIs you will ever use within your application.

### `bootstrap([...args])` (build only)

This is a semi-private function that is mainly being used internally, for example by [`@untool/yargs`](https://github.com/untool/untool/blob/master/packages/yargs/README.md). It returns a proxy object mimicking the core mixin container and thus allowing you to call all defined mixin methods.

You will only ever have to call it if you want to use `@untool/core` programmatically. Whatever arguments it receives are being passed along to the core container's mixins' constructors.
