# untool

[![travis](https://img.shields.io/travis/untool/untool.svg)](https://travis-ci.org/untool/untool)

`untool` is a JavaScript tool designed to streamline configuration and usage of other JavaScript tools. By default, it comes with a basic development and runtime environment for universal React applications. This environment is highly modular. Every one of its default modules is configurable and extensible - and entirely optional.

## Why?

JavaScript tooling is amazing nowadays. There are tons of bundlers, transpilers, analyzers, optimizers, minifiers, formatters, linters, build-, command- and test-runners, package managers... and then, of course, there are gazillions of frameworks, libraries, modules, components, extensions, plugins, addons, mixins...

Everything is just a `yarn add` (or `npm install`) away, available free of charge, all built, maintained and supported by enthusiast, diverse communities of voluteers. Things are truly looking peachy.

The sheer amount of tools has a couple of downsides, though. One of them is the fact that it has become increasingly tedious to wire up all these tools, to get and keep them working together.

Having to do so over and over again, probably for many different projects, can be a bit annoying - and frankly quite expensive. `untool` is being developed to alleviate this annoyance, to help make even complex tooling setups portable and shareable.

## How?

`untool` aims to be a tool for toolsmiths, enabling us to configure, combine and compose other tools. We try to keep it as minimal, extensible and un-opinionated as possible.

`untool` consists of a small [core](https://github.com/untool/untool/tree/master/packages/core) and some basic mixins providing build, development and production runtimes.

`untool`'s core is based on [`mixinable`](https://github.com/untool/mixinable), a highly flexible, declarative microframework providing a rather advanced mixin architecture. In `mixinable` parlance, `untool` mixins can define both application strategies and implementations.

This extensible core is built with a very powerful configuration engine with full support for presets and multiple environments. Its config can, of course, trivially be extended to support your own mixins and even your whole application. Your application can, in turn, be used as a preset in other apps.

## What?

Out of the box, `untool` leverages the likes of [Yargs](http://yargs.js.org), [Webpack](https://webpack.js.org) and [Express](https://expressjs.com). Its default app runtime implementation is based on [React](https://reactjs.org).

The default mixins expose hooks to completely alter their behaviour and functionality. Tap into them using your own mixins and reconfigure Webpack, register additional Express middlewares and Yargs commands or fetch data to bootstrap your React application.

Of course, you can also use `untool` to add custom mixins, in turn exposing their own hooks. There are three distinct types of mixins you can add: core, server, and browser. Core mixins are used for building and running your app, while the others are runtime mixins that are being used inside your actual application.

The [`@untool/react`](https://github.com/untool/untool/tree/master/packages/react) package comes with all three kinds of mixins. Why not use it as a starting point for your own mixins?

## What Next?

### Installation

As `untool` is completely modular, there is no single best way to install its different parts. Installing its global [command line interface](https://github.com/untool/untool/blob/master/packages/cli/README.md) (CLI), however, is a sensible way to get you started.

```bash
$ yarn global add untool # OR npm install --global untool
```

Having installed this global CLI package, you will be able to use it to set up your first `untool` project.

```text
$ mkdir foo && cd $_

$ un
? Initialize foo as new project? Yes
! Initializing project...
? Install untool default preset? Yes
! Installing (this can take a while)...

\o/ All done!

$ cat << EOT > index.js
> import React from 'react';
> import { render } from 'untool';
> export default render(<h1>bar</h1>);
> EOT

$ un start
untool info
server listening at http://localhost:8080

$ curl http://localhost:8080/
<!DOCTYPE html>
<html>
  <head>
    <title data-react-helmet="true"></title>
  </head>
  <body>
    <div id="foo"><h1 data-reactroot="">bar</h1></div>
    <script src="/foo.js"></script>
  </body>
</html>
```

### Utilization

To use `untool`, you certainly do not have to learn about all the parts and concepts it is build upon. A big part of what it aims to do is to allow toolsmiths and app builders to work independently of each other.

If you need to extend its features, you will want to take a peek into the black box, though. To become acquainted with `untool`'s innards, it certainly makes sense to dive into its README files. This is the recommended reading order:

* [`@untool/core`](https://github.com/untool/untool/blob/master/packages/core/README.md): central base module all other components rely upon
* [`@untool/defaults`](https://github.com/untool/untool/blob/master/packages/defaults/README.md): default preset incorporating all other core packages
* [`@untool/yargs`](https://github.com/untool/untool/blob/master/packages/yargs/README.md): extensible, project-local command line interface
* [`@untool/express`](https://github.com/untool/untool/blob/master/packages/express/README.md): extensible development and production server implementation
* [`@untool/webpack`](https://github.com/untool/untool/blob/master/packages/webpack/README.md): extensible webpack setup (including Babel and PostCSS)
* [`@untool/react`](https://github.com/untool/untool/blob/master/packages/react/README.md): extensible, universal React implementation

At some point, though, you will have to read our source files: if, for example, merely configuring [`@untool/webpack`](https://github.com/untool/untool/blob/master/packages/webpack/README.md) and using its existing hooks does not suffice for your requirements, you will probably want extend it.

### Contribution

We are using [git](https://git-scm.com), [lerna](https://lernajs.io) and [yarn](https://yarnpkg.com/en/) for building `untool`. To be able to help us out effectively, you have to have `git` and `yarn` globally available on your machine.

If you want to contribute to `untool`, create a [fork](https://help.github.com/articles/about-forks/) of its [repository](https://github.com/untool/untool/fork) using the GitHub UI and clone your fork into your local workspace:

```text
$ mkdir untool && cd $_
$ git clone git@github.com:<USER>/untool.git .
$ yarn install
```

When you are finished implementing your contribution, go ahead and create a [pull request](https://help.github.com/articles/creating-a-pull-request/). If you are planning to add a feature, please open an [issue](https://github.com/untool/untool/issues/new) first and discuss your plans.

All code in this repository is expected to be formatted using [prettier](https://prettier.io), and we will only merge valid [conventional commits](https://conventionalcommits.org) in order to enable automatic [versioning](https://semver.org).
