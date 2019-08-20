# untool v2

At the end of 2019 we want to release untool v2, which will serve as foundation
for Hops v12 (which will also be released at the end of this year).

Work on new features has already begun on the [next](https://github.com/untool/untool/tree/next) branch.

Following is a prioritized list of changes that we identified and would like to
implement in untool v2.

High priority:

- [ ] bump minimum required Node.js version to v10 (or even v12)
- [x] upgrade core-js to v3 ([469bf68](https://github.com/untool/untool/commit/469bf68aa47cc8563c42feb26f89be30aeda31c1))
- [ ] upgrade webpack to v5 ([wip](https://github.com/untool/untool/tree/webpack-5))
- [x] deprecate "string syntax" of `importComponent` ([b0b0d95](https://github.com/untool/untool/commit/b0b0d95496baeb92e58954d92e4dfdceebc0ae09))
- [ ] white-listing of environment variables / secrets ([RFC](https://github.com/untool/untool/issues/446))
- [ ] default values for environment variables in config placeholders ([RFC](https://github.com/untool/untool/issues/448))
- [ ] bump minimum required React.js version

Medium priority:

- [ ] increase test coverage by adding unit tests for all mixins
- [ ] webpack DLL support / sharing common bundles between applications
- [ ] improve build performance

Low priority:

- [ ] deprecate static rendering
- [ ] collapse `hops-express` into `@untool/express`

Nice to have:

- [ ] rename and clarify `mode` (`configureServer`) and `target` (`configureBuild`) values ([wip](https://github.com/untool/untool/tree/mode-target-confusion))
- [ ] configuration files and presets for common dependencies (babel, browserslist, etc)
- [ ] transpile express middlewares (some middlewares are built using ES modules or have dependencies on ES modules code)
- [ ] always provide cookie parser through `@untool/express`
- [ ] domain specific mixins