# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-rc.7](https://github.com/untool/untool/compare/v1.0.0-rc.6...v1.0.0-rc.7) (2018-10-21)


### Bug Fixes

* **react:** enable untool package ([16e23e5](https://github.com/untool/untool/commit/16e23e5))





# [1.0.0-rc.6](https://github.com/untool/untool/compare/v1.0.0-rc.5...v1.0.0-rc.6) (2018-10-17)

**Note:** Version bump only for package untool





# [1.0.0-rc.5](https://github.com/untool/untool/compare/v1.0.0-rc.4...v1.0.0-rc.5) (2018-10-17)


### Bug Fixes

* **webpack:** make cache target dependent ([28bcca4](https://github.com/untool/untool/commit/28bcca4))





# [1.0.0-rc.4](https://github.com/untool/untool/compare/v1.0.0-rc.3...v1.0.0-rc.4) (2018-10-16)


### Bug Fixes

* **webpack:** import middleware from correct folder ([0475466](https://github.com/untool/untool/commit/0475466))
* **webpack:** support comma separated browserslist queries ([07199b2](https://github.com/untool/untool/commit/07199b2))
* **webpack:** use target as name for getBuildConfig ([ce1ba84](https://github.com/untool/untool/commit/ce1ba84))





# [1.0.0-rc.3](https://github.com/untool/untool/compare/v1.0.0-rc.2...v1.0.0-rc.3) (2018-10-15)


### Bug Fixes

* **webpack:** remove obsolete helpers import ([eb41673](https://github.com/untool/untool/commit/eb41673))


### Features

* **react:** add some babel loader excludes ([a9fd835](https://github.com/untool/untool/commit/a9fd835))
* **webpack:** add ua detection middleware ([838af07](https://github.com/untool/untool/commit/838af07))
* **webpack:** babel everything (except polyfills) ([1a97e1c](https://github.com/untool/untool/commit/1a97e1c))
* **webpack:** introduce getRenderRequests hook ([c1b3141](https://github.com/untool/untool/commit/c1b3141))
* **webpack:** use adaptive module ids ([d4db5da](https://github.com/untool/untool/commit/d4db5da))
* **yargs:** re-enable un command ([b0f86d6](https://github.com/untool/untool/commit/b0f86d6))





# [1.0.0-rc.2](https://github.com/untool/untool/compare/v1.0.0-rc.1...v1.0.0-rc.2) (2018-10-10)


### Bug Fixes

* **express:** remove typo in import name (intialize -> initialize) ([e624623](https://github.com/untool/untool/commit/e624623))





# [1.0.0-rc.1](https://github.com/untool/untool/compare/v1.0.0-rc.0...v1.0.0-rc.1) (2018-10-10)


### Bug Fixes

* **express:** pass correct port parameter to getPort function ([f310296](https://github.com/untool/untool/commit/f310296))





# [1.0.0-rc.0](https://github.com/untool/untool/compare/v0.26.0...v1.0.0-rc.0) (2018-10-10)


### Bug Fixes

* **core:** allow calling getConfig without arguments ([f9731ce](https://github.com/untool/untool/commit/f9731ce))
* **core:** make base mixin class properly work at runtime ([8fc1350](https://github.com/untool/untool/commit/8fc1350))
* **webpack:** allow calling getConfig without arguments ([31f9cc3](https://github.com/untool/untool/commit/31f9cc3))
* **webpack:** bundle everything during node build ([c31a259](https://github.com/untool/untool/commit/c31a259))
* **webpack:** re-introduce config debug output ([ddb0ecd](https://github.com/untool/untool/commit/ddb0ecd))


### Features

* **react:** pass search to StaticRouter ([3f7401c](https://github.com/untool/untool/commit/3f7401c))
* **webpack:** introduce `collectBuildConfigs` hook ([f225655](https://github.com/untool/untool/commit/f225655))
* **webpack:** introduce `getBuildStats` utility hook ([590df85](https://github.com/untool/untool/commit/590df85))
* **yargs:** add optional logging mixin ([d465289](https://github.com/untool/untool/commit/d465289))





<a name="0.26.0"></a>
# [0.26.0](https://github.com/untool/untool/compare/v0.25.1...v0.26.0) (2018-10-01)


### Bug Fixes

* **webpack:** emit stats file only for parent compilation ([bea1daa](https://github.com/untool/untool/commit/bea1daa))


### Features

* **yargs:** npx-enable package ([d260ad9](https://github.com/untool/untool/commit/d260ad9))





<a name="0.25.1"></a>
## [0.25.1](https://github.com/untool/untool/compare/v0.25.0...v0.25.1) (2018-09-28)


### Bug Fixes

* **core:** make sure core is always included in build ([9971d54](https://github.com/untool/untool/commit/9971d54))





<a name="0.25.0"></a>
# [0.25.0](https://github.com/untool/untool/compare/v0.24.1...v0.25.0) (2018-09-28)


### Bug Fixes

* **webpack:** handle all compile errors ([d2f1dbe](https://github.com/untool/untool/commit/d2f1dbe))


### Features

* **core:** add internal exports ([061c541](https://github.com/untool/untool/commit/061c541))
* **core:** make mixin types configurable ([c1df54a](https://github.com/untool/untool/commit/c1df54a))
* **react:** add internal exports ([54ed554](https://github.com/untool/untool/commit/54ed554))
* **webpack:** add runtime shim, rewrite loader ([5b6588f](https://github.com/untool/untool/commit/5b6588f))





<a name="0.24.1"></a>
## [0.24.1](https://github.com/untool/untool/compare/v0.24.0...v0.24.1) (2018-09-27)


### Bug Fixes

* **webpack:** re-implement stats analysis ([47e1c4d](https://github.com/untool/untool/commit/47e1c4d))





<a name="0.24.0"></a>
# [0.24.0](https://github.com/untool/untool/compare/v0.23.0...v0.24.0) (2018-09-26)


### Bug Fixes

* **webpack:** dismiss modules which are not in any chunks ([45edf54](https://github.com/untool/untool/commit/45edf54))
* update dependency is-builtin-module to v3 ([5ced58b](https://github.com/untool/untool/commit/5ced58b))


### Features

* **core:** make config namespace configurable ([b2df149](https://github.com/untool/untool/commit/b2df149))





<a name="0.23.0"></a>
# [0.23.0](https://github.com/untool/untool/compare/v0.22.0...v0.23.0) (2018-09-25)


### Bug Fixes

* **react:** get rid of html cosmetics ([827f76d](https://github.com/untool/untool/commit/827f76d))
* switch to esm imports where possible ([b27b212](https://github.com/untool/untool/commit/b27b212))


### Features

* **react:** add code-splitting `Import` component ([be424fe](https://github.com/untool/untool/commit/be424fe))
* **react:** add loader prop instead of placeholder ([528d547](https://github.com/untool/untool/commit/528d547))
* **react:** add support for nested async imports ([4352b67](https://github.com/untool/untool/commit/4352b67))
* **react:** deep import react-router to avoid bundling everything ([c0d00ef](https://github.com/untool/untool/commit/c0d00ef))
* **react:** introduce `ImportPlaceholder` export ([488baa8](https://github.com/untool/untool/commit/488baa8))
* **react:** introduce placeholder render prop ([87aa46b](https://github.com/untool/untool/commit/87aa46b))
* **react:** make `Import` location configurable ([e7c46cc](https://github.com/untool/untool/commit/e7c46cc))
* **webpack:** add stats data needed for code splitting ([7d2b7aa](https://github.com/untool/untool/commit/7d2b7aa))
* **webpack:** pass "target" to webpack config loader ([5526fe5](https://github.com/untool/untool/commit/5526fe5))
* **webpack:** switch from uglify to terser ([66a2262](https://github.com/untool/untool/commit/66a2262)), closes [#144](https://github.com/untool/untool/issues/144)
* **webpack:** use esm in browser entry to enable possible tree-shaking ([9d6516e](https://github.com/untool/untool/commit/9d6516e))
* **webpack:** use esm in node entry to enable possible tree shaking ([34b1083](https://github.com/untool/untool/commit/34b1083))





<a name="0.22.0"></a>
# [0.22.0](https://github.com/untool/untool/compare/v0.21.0...v0.22.0) (2018-09-13)


### Bug Fixes

* **webpack:** limit per-request memory ([b91209b](https://github.com/untool/untool/commit/b91209b))
* **webpack:** reset resolvable on watch run ([0c24072](https://github.com/untool/untool/commit/0c24072))


### Features

* **react:** clone `this.assets` to ensure extensibility ([4f51abb](https://github.com/untool/untool/commit/4f51abb))





<a name="0.21.0"></a>
# [0.21.0](https://github.com/untool/untool/compare/v0.20.0...v0.21.0) (2018-09-11)


### Bug Fixes

* **webpack:** clone asset metadata in middleware ([46a69ca](https://github.com/untool/untool/commit/46a69ca)), closes [#132](https://github.com/untool/untool/issues/132)
* **webpack:** make sure resovable is being resolved in all conditions ([ee10a25](https://github.com/untool/untool/commit/ee10a25))
* update dependency debug to v4 ([47abf31](https://github.com/untool/untool/commit/47abf31))


### Features

* **webpack:** add stats (instead of asset data) ([a7324af](https://github.com/untool/untool/commit/a7324af))





<a name="0.20.0"></a>
# [0.20.0](https://github.com/untool/untool/compare/v0.19.0...v0.20.0) (2018-09-10)


### Features

* **react:** remove flow support ([a7b4d6f](https://github.com/untool/untool/commit/a7b4d6f)), closes [babel/babel#8417](https://github.com/babel/babel/issues/8417)
* **webpack:** add server source maps in production ([85b1ef6](https://github.com/untool/untool/commit/85b1ef6))





<a name="0.19.0"></a>
# [0.19.0](https://github.com/untool/untool/compare/v0.18.0...v0.19.0) (2018-09-06)


### Bug Fixes

* **webpack:** fix rendering of multiple locations ([11e7e7f](https://github.com/untool/untool/commit/11e7e7f))


### Features

* **express:** add "trimSlashes" export to URI package ([fce8975](https://github.com/untool/untool/commit/fce8975))





<a name="0.18.0"></a>
# [0.18.0](https://github.com/untool/untool/compare/v0.17.2...v0.18.0) (2018-09-03)


### Bug Fixes

* **webpack:** set source type to 'unambiguous' ([13bc15c](https://github.com/untool/untool/commit/13bc15c))


### Features

* **react:** upgrade babel to v7 ([e29b190](https://github.com/untool/untool/commit/e29b190))
* **webpack:** upgrade babel to v7 ([921f149](https://github.com/untool/untool/commit/921f149))





<a name="0.17.2"></a>
## [0.17.2](https://github.com/untool/untool/compare/v0.17.1...v0.17.2) (2018-08-23)


### Bug Fixes

* update dependency file-loader to v2 ([613456b](https://github.com/untool/untool/commit/613456b))
* **webpack:** move assets starting with "vendors~" to the top ([2b65269](https://github.com/untool/untool/commit/2b65269))





<a name="0.17.1"></a>
## [0.17.1](https://github.com/untool/untool/compare/v0.17.0...v0.17.1) (2018-08-20)

**Note:** Version bump only for package untool





<a name="0.17.0"></a>
# [0.17.0](https://github.com/untool/untool/compare/v0.16.0...v0.17.0) (2018-08-17)


### Features

* **core:** let `bootstrap`/`Mixin` accept options ([e52aceb](https://github.com/untool/untool/commit/e52aceb))
* **express:** make exports configurable ([5a735b3](https://github.com/untool/untool/commit/5a735b3))
* **untool:** enable option to silence log output ([e972da7](https://github.com/untool/untool/commit/e972da7))
* **untool:** introduce configurable export ([178c6cb](https://github.com/untool/untool/commit/178c6cb))
* **webpack:** make exports configurable ([dd4c4e8](https://github.com/untool/untool/commit/dd4c4e8))
