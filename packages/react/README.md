# `@untool/react`

[![travis](https://img.shields.io/travis/untool/untool/master.svg)](https://travis-ci.org/untool/untool)&nbsp;[![npm](https://img.shields.io/npm/v/@untool%2Freact.svg)](https://www.npmjs.com/package/@untool/react)

`@untool/react`'s main runtime exports are a couple of React components that allow implementers to declaratively control server (or system) behavior. Additionally, `@untool/react` features full support for [`react-router`](https://github.com/ReactTraining/react-router)'s and [`react-helmet`](https://github.com/nfl/react-helmet)'s components.

`@untool/react` provides all three types of `@untool/core` [mixin types](../core/README.md#mixins). Its `core` mixin uses `@untool/webpack`'s [`configureBuild`](../webpack/README.md#configurebuildwebpackconfig-loaderconfigs-target-pipe) hook to add some settings specific to [React](https://reactjs.org), for example support for [JSX](https://reactjs.org/docs/introducing-jsx.html) syntax.

Its `runtime`, i.e. `browser` and `server`, mixins are a bit more interesting as they are `untool`'s only default [`render`](../core/README.md#renderargs-runtime-only) mixins. They set up [React](https://reactjs.org) for client- and server-side rendering. Additionally, they provide mixin hooks of their own to allow you to add your own features, for example [Redux](https://redux.js.org) support.

During application startup, `@untool/react` runs a check to determine if certain npm packages are installed multiple times. If you see warnings telling you that this is the case, you will want to make sure you get rid of these duplicates, as they will almost certainly break things in interesting ways.

### Installation

```bash
$ yarn add @untool/react react react-dom react-router-dom react-helmet
# OR npm install @untool/react react react-dom react-router-dom react-helmet
```

## `render(element, [options])`

`render()` is `@untool/react`'s main export. You are expected to call it in your applications main entry file and it is essentialy a shorthand: it creates and bootstraps a mixin container and calls its `render` method.

`render` accepts two arguments: a react element and an optional options object. `@untool/react` will use the contents of `options.router` to configure the [React Router](https://github.com/ReactTraining/react-router) instances it controls.

```javascript
import React from 'react';
import { render } from '@untool/react';
export default render(<h1>hello world</h1>);
```

The `render` function serves two main purposes: 'universalifying' or 'isomorphizing' you application, i.e. making sure your app's code can run both on a server and in a browser, and integrating `untool`'s build and runtime environments.

## Components

### `<Miss />`

This component allows you to instruct `@untool/react` to call Express.js' [middleware `next`](https://expressjs.com/en/guide/using-middleware.html) function. On the client side, it is effectively a no-op.

```javascript
import { Miss } from '@untool/react';

export default () => <Miss />;
```

### `<Status code />`

This component enables you to instruct `@untool/react` to send a different HTTP status code than the default of 200. On the client side, it is effectively a no-op.

```javascript
import { Status } from '@untool/react';

export default () => <Status code={404} />;
```

### `<Header name value />`

With this component, you can declaratively set arbitrary HTTP headers from your React application. On the client side, it is effectively a no-op.

```javascript
import { Header } from '@untool/react';

export default () => <Header name="X-Foo" value="Bar" />;
```

### `importComponent(module|moduleLoader, [exportName|exportResolver])`

Using the `importComponent` helper, you can asynchronously require components into your application to help you reduce asset sizes. It works similarly to [`react-loadable`](https://github.com/jamiebuilds/react-loadable), but is deeply integrated with `untool`.

```javascript
import { importComponent } from '@untool/react';

const Home = importComponent('./home', 'Home');

export default () => <Home />;
```

Additionally, `importComponent` supports an alternative syntax that helps with editor and type checker integration since it does not rely on plain strings. The snippet below is functionally equivalent to the one above:

```javascript
import { importComponent } from '@untool/react';

const Home = importComponent(
  () => import('./home'),
  ({ Home }) => Home
);

export default () => <Home />;
```

If you do no specify an `exportName` or `exportResolver`, `importComponent` will fall back to the imported modules `default` export.

`importComponent` itself returns a React component supporting some props that enable you to control module loading and (placeholder) rendering.

```javascript
import { importComponent } from '@untool/react';

const About = importComponent('./about', 'About');

const loader = (load) =>
  Promise.race([
    new Promise((resolve, reject) => setTimeout(reject, 10000)),
    load(),
  ]);

const render = ({ Component, error, loading, ...props }) => {
  return !(error || loading) ? <Component {...props} /> : null;
};

export default () => <About loader={loader} render={render} />;
```

Components loaded using `importComponent` (and their dependencies) will be placed in separate chunks, i.e. asset files. `@untool/react` makes sure that all asset files containing modules used for server-side rendering are referenced in the initial HTML output.

## API

### `render([req, res, next])` ([override](https://github.com/untool/mixinable/blob/master/README.md#defineoverride))

This method is being called whenever you call the main `render` method. In a server-side, i.e. Node.js, environment it receives the usual arguments any Express [middleware](https://expressjs.com/en/guide/writing-middleware.html) receives: `req`, `res`, and `next`. In a client-side, i.e. browser, environment it receives no arguments whatsoever.

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

Remember you can register custom middlewares using [`@untool/express`](../express/README.md#initializeserverapp-target-sequence) instead of implementing elaborate request or response handling logic inside your runtime mixin.

### `enhanceElement(element)` ([compose](https://github.com/untool/mixinable/blob/master/README.md#definecompose))

With this method, you can wrap the React root element with additional components, like Redux' [Provider](https://redux.js.org/basics/usage-with-react). If you need to do something asynchronous in this method, just return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) resolving to the wrapped element.

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooMixin extends Mixin {
  enhanceElement(element) {
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

### `getTemplateData(data)` ([pipe](https://github.com/untool/mixinable/blob/master/README.md#definepipe), Server Only)

In case you need to gather additional template data after React rendering, e.g. if you are using [styled components](https://www.styled-components.com), you can add the required data by implementing this hook in your custom mixin. To do so asynchronously, have this method return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) resolving to the extended data.

```javascript
const { Mixin } = require('@untool/core');

module.exports = class FooMixin extends Mixin {
  getTemplateData(data) {
    return { ...data, baz: 'qux' };
  }
};
```

This hook is only used for server-side rendering, i.e. it will not be called in the browser.
