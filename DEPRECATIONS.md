# Deprecations

### DEP001

Using a string as loader for `importComponent` is deprecated and will be removed in a future major release.

```diff
- importComponent('./my-cool-component');
+ importComponent(() => import('./my-cool-component'));
```

### DEP002

Using a string to resolve the module of `importComponent` is deprecated and will be removed in a future major release.

```diff
- importComponent(() => import('./my-cool-component'), 'MyCoolComponent');
+ importComponent(() => import('./my-cool-component'), namespace => namespace.MyCoolComponent);
```
