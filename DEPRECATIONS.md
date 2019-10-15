# Deprecations

## DEP001

Using a string as loader for `importComponent` is deprecated and will be removed in a future major release.

```diff
- importComponent('./my-cool-component');
+ importComponent(() => import('./my-cool-component'));
```

## DEP002

Using a string to resolve the module of `importComponent` is deprecated and will be removed in a future major release.

```diff
- importComponent(() => import('./my-cool-component'), 'MyCoolComponent');
+ importComponent(() => import('./my-cool-component'), namespace => namespace.MyCoolComponent);
```

## DEP003

Static rendering is deprecated and will be removed in a future major release.

## DEP004

`react-helmet` is deprecated and has been replaced with `react-helmet-async`. If you see this message, either your code or some of your dependencies tried to import from `react-helmet`. Please replace all instances of `react-helmet` with `react-helmet-async`.

```diff
- import { Helmet } from 'react-helmet';
+ import { Helmet } from 'react-helmet-async';
```

Also: `react-helmet-async` no longer provides a default export. Therefore you may need to change the imports too:

```diff
- import Helmet from 'react-helmet-async';
+ import { Helmet } from 'react-helmet-async';
```
