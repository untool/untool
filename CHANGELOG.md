# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.4.1](https://github.com/untool/untool/compare/v1.4.0...v1.4.1) (2019-03-22)


### Bug Fixes

* **webpack:** improve cross plattform compatibility ([23b2c36](https://github.com/untool/untool/commit/23b2c36))
* **webpack:** prevent core-js transpilation on windows ([f11e4f3](https://github.com/untool/untool/commit/f11e4f3))





# [1.4.0](https://github.com/untool/untool/compare/v1.3.1...v1.4.0) (2019-03-18)


### Bug Fixes

* **react:** switch to supported react router imports ([1e3f04b](https://github.com/untool/untool/commit/1e3f04b))
* update dependency dotenv to v7 ([3c8d183](https://github.com/untool/untool/commit/3c8d183))
* **express:** make error handler work in static mode ([834931f](https://github.com/untool/untool/commit/834931f))
* **yargs:** re-enable and tweak request logging ([d48119a](https://github.com/untool/untool/commit/d48119a))
* **yargs:** restore node v8 compatibility ([a95932b](https://github.com/untool/untool/commit/a95932b))


### Features

* **core:** add config schema validation ([ac1c2b0](https://github.com/untool/untool/commit/ac1c2b0))
* **express:** add `getServerAddress` hook ([3772328](https://github.com/untool/untool/commit/3772328))
* **express:** add config schema ([73d1031](https://github.com/untool/untool/commit/73d1031))
* **express:** emit startup event ([cae549b](https://github.com/untool/untool/commit/cae549b))
* **express:** introduce log middleware ([79f77c7](https://github.com/untool/untool/commit/79f77c7))
* **express:** use central logging facility ([bc5bd7f](https://github.com/untool/untool/commit/bc5bd7f))
* **react:** implement `runChecks` hook ([1d61f0a](https://github.com/untool/untool/commit/1d61f0a))
* **react:** implement diagnose hook ([859e58b](https://github.com/untool/untool/commit/859e58b))
* **untool:** add info package ([bc9e27e](https://github.com/untool/untool/commit/bc9e27e))
* **webpack:** add config schema ([1068700](https://github.com/untool/untool/commit/1068700))
* **webpack:** disable HMR logging in node ([6c82c81](https://github.com/untool/untool/commit/6c82c81))
* **webpack:** implement `runChecks` hook ([24768c6](https://github.com/untool/untool/commit/24768c6))
* **webpack:** implement diagnose hook ([dac2d19](https://github.com/untool/untool/commit/dac2d19))
* **webpack:** introduce log plugin ([84b5b21](https://github.com/untool/untool/commit/84b5b21))
* **yargs:** add `bootstrap` and `runChecks` hooks ([3adc3e6](https://github.com/untool/untool/commit/3adc3e6))
* **yargs:** add full webpack error handling ([ef43e26](https://github.com/untool/untool/commit/ef43e26))
* **yargs:** add request logging, verbose flag ([b16f3b6](https://github.com/untool/untool/commit/b16f3b6))
* **yargs:** add support for arbitrary message types ([a8591d0](https://github.com/untool/untool/commit/a8591d0))
* **yargs:** colorize log output ([575a6b5](https://github.com/untool/untool/commit/575a6b5))
* **yargs:** improve webpack logging ([d8532f8](https://github.com/untool/untool/commit/d8532f8))
* **yargs:** tweak express request log output ([de5f5dd](https://github.com/untool/untool/commit/de5f5dd))





## [1.3.1](https://github.com/untool/untool/compare/v1.3.0...v1.3.1) (2019-03-07)


### Bug Fixes

* **webpack:** make validation work after hmr ([6f498b2](https://github.com/untool/untool/commit/6f498b2))





# [1.3.0](https://github.com/untool/untool/compare/v1.2.0...v1.3.0) (2019-03-01)


### Features

* **react:** allow to instruct babel plugin to use require.resolve ([d614afe](https://github.com/untool/untool/commit/d614afe))





# [1.2.0](https://github.com/untool/untool/compare/v1.1.0...v1.2.0) (2019-02-27)


### Bug Fixes

* **express:** rely on Express to add app to req ([f392af6](https://github.com/untool/untool/commit/f392af6))
* **react:** only allow arrow function with single import() statement ([2bbbdcc](https://github.com/untool/untool/commit/2bbbdcc))
* **webpack:** re-enable node source maps ([3f40319](https://github.com/untool/untool/commit/3f40319))


### Features

* **core:** introduce validation helpers ([c931a20](https://github.com/untool/untool/commit/c931a20))
* **express:** add arg validation to mixin methods ([2dca3f8](https://github.com/untool/untool/commit/2dca3f8))
* **react:** add arg validation to mixin methods ([c03e897](https://github.com/untool/untool/commit/c03e897))
* **react:** add arg/prop validation to public API ([9150954](https://github.com/untool/untool/commit/9150954))
* **react:** allow function as namespace resolver ([11d20a2](https://github.com/untool/untool/commit/11d20a2))
* **react:** allow import load function in importComponent ([dbeea04](https://github.com/untool/untool/commit/dbeea04))
* **webpack:** add arg validation to mixin methods ([b17d1a7](https://github.com/untool/untool/commit/b17d1a7))
* **webpack:** allow to ignore url-loader for specific requests ([47ff03a](https://github.com/untool/untool/commit/47ff03a)), closes [xing/hops#557](https://github.com/xing/hops/issues/557)
* **yargs:** add arg validation to mixin methods ([cced80e](https://github.com/untool/untool/commit/cced80e))





# [1.1.0](https://github.com/untool/untool/compare/v1.0.0...v1.1.0) (2019-02-14)


### Features

* update dependency yargs to v13 ([ec99f47](https://github.com/untool/untool/commit/ec99f47))
* **core:** add config utils to internal exports ([c65a4a8](https://github.com/untool/untool/commit/c65a4a8))
* **webpack:** use `publicPath` in `statsPlugin` ([7134eae](https://github.com/untool/untool/commit/7134eae))





# [1.0.0](https://github.com/untool/untool/compare/v1.0.0-rc.20...v1.0.0) (2019-01-29)

**Note:** Version bump only for package ununtool





# [1.0.0-rc.20](https://github.com/untool/untool/compare/v1.0.0-rc.19...v1.0.0-rc.20) (2019-01-24)


### Bug Fixes

* **express:** keep length property of middleware handlers ([361739f](https://github.com/untool/untool/commit/361739f))
* **webpack:** register webpack specific mixin types ([da8eaf4](https://github.com/untool/untool/commit/da8eaf4))


### Features

* **core:** make mixin types configurable ([40c5399](https://github.com/untool/untool/commit/40c5399))





# [1.0.0-rc.19](https://github.com/untool/untool/compare/v1.0.0-rc.18...v1.0.0-rc.19) (2019-01-22)


### Bug Fixes

* **core:** add empty mixins array to defaults ([4e24751](https://github.com/untool/untool/commit/4e24751))
* **webpack:** prevent needless rendering ([de2e1c1](https://github.com/untool/untool/commit/de2e1c1))





# [1.0.0-rc.18](https://github.com/untool/untool/compare/v1.0.0-rc.17...v1.0.0-rc.18) (2019-01-18)


### Features

* **express:** add support for route/method handlers ([bba1f60](https://github.com/untool/untool/commit/bba1f60))





# [1.0.0-rc.17](https://github.com/untool/untool/compare/v1.0.0-rc.16...v1.0.0-rc.17) (2019-01-17)


### Bug Fixes

* **react:** do not error when importComponent module not found ([af455e3](https://github.com/untool/untool/commit/af455e3))
* **react:** do not render "undefined" as a value in the template ([42fc93a](https://github.com/untool/untool/commit/42fc93a))
* **webpack:** derive outfile from strings ([5d43534](https://github.com/untool/untool/commit/5d43534))


### Features

* **express:** add graceful exception handling ([7f89605](https://github.com/untool/untool/commit/7f89605))
* **express:** add support for res.locals ([7e1995c](https://github.com/untool/untool/commit/7e1995c))
* **yargs:** write log upon graceful server shutdown ([04e589c](https://github.com/untool/untool/commit/04e589c))





# [1.0.0-rc.16](https://github.com/untool/untool/compare/v1.0.0-rc.15...v1.0.0-rc.16) (2019-01-09)


### Bug Fixes

* **webpack:** simplify module/chunk mapping ([b475ef1](https://github.com/untool/untool/commit/b475ef1)), closes [xing/hops#758](https://github.com/xing/hops/issues/758) [/github.com/jamiebuilds/react-loadable/blob/master/src/webpack.js#L18-L20](https://github.com//github.com/jamiebuilds/react-loadable/blob/master/src/webpack.js/issues/L18-L20)





# [1.0.0-rc.15](https://github.com/untool/untool/compare/v1.0.0-rc.14...v1.0.0-rc.15) (2019-01-03)


### Bug Fixes

* remove dependency browserslist-useragent ([a9d987a](https://github.com/untool/untool/commit/a9d987a))
* update dependency ava to v1 ([a8ca3f8](https://github.com/untool/untool/commit/a8ca3f8))
* update dependency file-loader to v3 ([fe4591b](https://github.com/untool/untool/commit/fe4591b))
* update dependency supports-color to v6 ([a8a26ff](https://github.com/untool/untool/commit/a8a26ff))
* **webpack:** ignore child-compilers in RenderPlugin ([7c438ad](https://github.com/untool/untool/commit/7c438ad))





# [1.0.0-rc.14](https://github.com/untool/untool/compare/v1.0.0-rc.13...v1.0.0-rc.14) (2018-12-07)


### Bug Fixes

* **webpack:** use NODE_ENV instead of argument ([8a3dc6a](https://github.com/untool/untool/commit/8a3dc6a))
* **yargs:** use NODE_ENV instead of argument ([2f40f57](https://github.com/untool/untool/commit/2f40f57))





# [1.0.0-rc.13](https://github.com/untool/untool/compare/v1.0.0-rc.12...v1.0.0-rc.13) (2018-12-05)


### Bug Fixes

* **react:** add babel/core as a dependency ([09cce6f](https://github.com/untool/untool/commit/09cce6f)), closes [#220](https://github.com/untool/untool/issues/220)
* **react:** bump minimum React version to 16.4 ([dc7cb4a](https://github.com/untool/untool/commit/dc7cb4a))





# [1.0.0-rc.12](https://github.com/untool/untool/compare/v1.0.0-rc.11...v1.0.0-rc.12) (2018-12-03)


### Bug Fixes

* do not exclude packages from transpilation ([63fffab](https://github.com/untool/untool/commit/63fffab))
* **yargs:** prevent premature arg evaluation ([9769860](https://github.com/untool/untool/commit/9769860)), closes [#215](https://github.com/untool/untool/issues/215)


### Features

* **webpack:** allow definiton of modules with NODE_PATH ([8375e47](https://github.com/untool/untool/commit/8375e47))
* **webpack:** allow definiton of modules with NODE_PATH ([ba524f4](https://github.com/untool/untool/commit/ba524f4))





# [1.0.0-rc.11](https://github.com/untool/untool/compare/v1.0.0-rc.10...v1.0.0-rc.11) (2018-11-19)


### Bug Fixes

* **webpack:** prevent dev server crashing on error ([b8c6934](https://github.com/untool/untool/commit/b8c6934))


### Features

* **webpack:** remove agent middleware ([35294ef](https://github.com/untool/untool/commit/35294ef))





# [1.0.0-rc.10](https://github.com/untool/untool/compare/v1.0.0-rc.9...v1.0.0-rc.10) (2018-11-15)


### Features

* **webpack:** use HMR for server-side code ([f7f73cf](https://github.com/untool/untool/commit/f7f73cf))





# [1.0.0-rc.9](https://github.com/untool/untool/compare/v1.0.0-rc.8...v1.0.0-rc.9) (2018-11-15)


### Bug Fixes

* **react:** avoid special chars causing issues with React mountpoint ([7989fce](https://github.com/untool/untool/commit/7989fce))


### Features

* **webpack:** support ESM via ".mjs" ext and "module" package field ([daaeb4b](https://github.com/untool/untool/commit/daaeb4b)), closes [/github.com/webpack/webpack/blob/v4.23.1/lib/WebpackOptionsDefaulter.js#L327-L348](https://github.com//github.com/webpack/webpack/blob/v4.23.1/lib/WebpackOptionsDefaulter.js/issues/L327-L348)


### Performance Improvements

* **webpack:** only re-evaluate config when overrides exist ([ef4a5a8](https://github.com/untool/untool/commit/ef4a5a8))





# [1.0.0-rc.8](https://github.com/untool/untool/compare/v1.0.0-rc.7...v1.0.0-rc.8) (2018-10-23)


### Bug Fixes

* **core:** ensure mixins will only be added once ([239fd74](https://github.com/untool/untool/commit/239fd74))





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
