# `@untool/react`

[![npm](https://img.shields.io/npm/v/@untool%2Freact.svg)](https://www.npmjs.com/package/@untool%2Freact)

`@untool/react` provides all three types of `@untool/core` [mixins](https://github.com/untool/untool/blob/master/packages/core/README.md#mixins). Its `core` mixin uses `@untool/webpack`'s [`configureBuild`](https://github.com/untool/untool/blob/master/packages/webpack/README.md#configurebuildwebpackconfig-loaderconfigs-target-pipe) hook to add some settings specific to [React](https://reactjs.org), for example support for [JSX](https://reactjs.org/docs/introducing-jsx.html) syntax.

Its `runtime`, i.e. `browser` and `server`, mixins are a bit more interesting as they are `untool`'s only default [`render`](https://github.com/untool/untool/blob/master/packages/core/README.md#renderargs-runtime-only) mixins. They set up [React](https://reactjs.org) for client- and server-side rendering. Additionally, they provide mixin hooks of their own to allow you to add your own features, for example [Redux](https://redux.js.org) support.

### Installation

```bash
$ yarn add @untool/react react react-dom react-helmet react-router react-router-dom
# OR npm install @untool/react react react-dom react-helmet react-router react-router-dom
```

## API

### `render([req, res, next])` ([override](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

This method is being called from within `@untool/core` whenever you call its `render` method. In a server-side, i.e. Node.js, environment it receives the usual arguments any Express [middleware](https://expressjs.com/en/guide/writing-middleware.html) receives: `req`, `res`, and `next`. In a client-side, i.e. browser, environment it receives no arguments whatsoever.

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooMixin extends Mixin {
  render(req, res, next) {
    if (req) {
      // server
    } else {
      // browser
    }
  }
};
```

You will not usually have to override this method as it exposes the following mixin hooks to alter its behaviour. In a server-side environment, a fresh `mixinable` container is being created for every request, including new mixin instances.

### `bootstrap([req, res])` ([parallel](https://github.com/untool/mixinable/blob/master/README.md#defineparallel))

Within this method, you are expected to set up your application. Your implementation will receive both Express' [`req`](https://expressjs.com/en/4x/api.html#req) and [`res`](https://expressjs.com/en/4x/api.html#res) objects for you to do whatever you like with. If you need to do something asynchronous in this method, just return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooMixin extends Mixin {
  bootstrap(req, res) {
    if (req) {
      // server
    } else {
      // browser
    }
  }
};
```

Remember you can register custom middlewares using [`@untool/express`](https://github.com/untool/untool/blob/master/packages/express/README.md#initializeserverapp-target-sequence) instead of implementing elaborate request or response handling logic inside your runtime mixin.

### `enhanceElement(element)` ([compose](https://github.com/untool/mixinable/blob/master/README.md#definecompose))

With this method, you can wrap the React root element with additional components, like Redux' [Provider](https://redux.js.org/basics/usage-with-react). If you need to do something asynchronous in this method, just return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) resolving to the wrapped element.

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooMixin extends Mixin {
  bootstrap(element) {
    return element;
  }
};
```

### `fetchData(data, element)` ([pipe](https://github.com/untool/mixinable/blob/master/README.md#definepipe))

Most applications need some sort of data. Implement this method in your mixin, to fetch said data before rendering and return an object with that additional data. If you need to do something asynchronous in this method, just return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) resolving to the data.

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooMixin extends Mixin {
  fetchData(data, element) {
    return { ...data, foo: 'bar' };
  }
};
```

### `enhanceData(data)` ([pipe](https://github.com/untool/mixinable/blob/master/README.md#definepipe))

In case you need to gather additional data after rendering, e.g. if you are using [styled components](https://www.styled-components.com) for server-side rendering, you can add the required template data by implementing this hook in your custom mixin. To do asynchronously, have this method return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) resolving to the extended data.

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooMixin extends Mixin {
  enhanceData(data) {
    return { ...data, baz: 'qux' };
  }
};
```
