<p align="center">
  <img
    width="115"
    height="115"
    src="https://avatars0.githubusercontent.com/u/36716786?s=460&v=4"
  />
</p>

<h1 align="center">untool</h1>

<p align="center">
  <a href="https://travis-ci.org/untool/untool">
    <img src="https://img.shields.io/travis/untool/untool.svg">
  </a>
</p>
<p>&nbsp;</p>

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
> export default render(<h1>meep.</h1>);
> EOT

$ un start

$ curl http://localhost:8080/
<!DOCTYPE html>
<html>
  <head>
    <title data-react-helmet="true"></title>
  </head>
  <body>
    <div id="foo"><h1 data-reactroot="">foo</h1></div>
    <script src="/foo.js"></script>
  </body>
</html>
```

## Why?

JavaScript tooling is amazing nowadays. There are tons of bundlers, transpilers, analyzers, optimizers, minifiers, formatters, linters, build-, command- and test-runners, package managers... and then, of course, there are gazillions of frameworks, libraries, modules, components, extensions, plugins, addons, mixins.

Everything is just a `yarn add` (or `npm install`) away, available free of charge, all built, maintained and supported by enthusiast, diverse communities of voluteers. Things are truly looking peachy.

The sheer amount of tools has a couple of downsides, though. One of them is the fact that it has become increasingly tedious to wire up all these tools, to get and keep them working together.

Having to do so over and over again, probably for many different projects, can be a bit annoying - and frankly quite expensive. Untool is being developed to alleviate this annoyance, to help make even complex tooling setups portable and shareable.

## How?

Untool aims to be a tool for toolsmiths, enabling us to configure, combine and compose other tools. We try to keep it as minimal, extensible and un-opinionated as possible.

Untool consists of a small [core](https://github.com/untool/untool/tree/master/packages/core) and some basic mixins providing build, development and production runtimes.

Its core is built around a very powerful configuration engine with full support for presets and multiple environments. It can, of course, trivially be extended to support your own mixins and even your whole application. Your application can, in turn, be used as a preset in other apps.

## What?

Out of the box, untool leverages the likes of [Yargs](http://yargs.js.org), [Webpack](https://webpack.js.org) and [Express](https://expressjs.com). Its default app runtime implementation is based on [React](https://reactjs.org).

These default mixins expose hooks to completely alter their behaviour and functionality. Tap into them using your own mixins and configure Webpack, register additional Express middlewares and Yargs commands or fetch data to bootstrap your React application. Please refer to their docs to find out what you can do with them: [Yargs](https://github.com/untool/untool/tree/master/packages/yargs#readme), [Webpack](https://github.com/untool/untool/tree/master/packages/webpack#readme), [Express](https://github.com/untool/untool/tree/master/packages/express#readme), [React](https://github.com/untool/untool/tree/master/packages/react#readme).

Of course, you can also use untool to add custom mixins, in turn exposing their own hooks. Untool is based on [mixinable](https://www.npmjs.com/package/mixinable), a highly flexible, declarative microframework providing a rather advanced mixin architecture. Please check out the default mixins to get an idea of what you can do with it in untools context.
