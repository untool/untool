# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.5.1](https://github.com/untool/untool/compare/v1.5.0...v1.5.1) (2019-03-27)

**Note:** Version bump only for package @untool/webpack





# [1.5.0](https://github.com/untool/untool/compare/v1.4.1...v1.5.0) (2019-03-26)


### Bug Fixes

* **webpack:** polyfill EventSource to make HMR work on Win/Edge ([50071dc](https://github.com/untool/untool/commit/50071dc))
* **webpack:** use async-node target to circumvent Node 11.11.0 bug ([3b6cada](https://github.com/untool/untool/commit/3b6cada))
* **webpack:** use events instead of signals to make hmr work on windows ([dfae72a](https://github.com/untool/untool/commit/dfae72a))


### Features

* **core:** add "absolutePath" keyword to ajv config validation ([7dca480](https://github.com/untool/untool/commit/7dca480))





## [1.4.1](https://github.com/untool/untool/compare/v1.4.0...v1.4.1) (2019-03-22)


### Bug Fixes

* **webpack:** improve cross plattform compatibility ([23b2c36](https://github.com/untool/untool/commit/23b2c36))
* **webpack:** prevent core-js transpilation on windows ([f11e4f3](https://github.com/untool/untool/commit/f11e4f3))





# [1.4.0](https://github.com/untool/untool/compare/v1.3.1...v1.4.0) (2019-03-18)


### Features

* **webpack:** add config schema ([1068700](https://github.com/untool/untool/commit/1068700))
* **webpack:** disable HMR logging in node ([6c82c81](https://github.com/untool/untool/commit/6c82c81))
* **webpack:** implement `runChecks` hook ([24768c6](https://github.com/untool/untool/commit/24768c6))
* **webpack:** implement diagnose hook ([dac2d19](https://github.com/untool/untool/commit/dac2d19))
* **webpack:** introduce log plugin ([84b5b21](https://github.com/untool/untool/commit/84b5b21))





## [1.3.1](https://github.com/untool/untool/compare/v1.3.0...v1.3.1) (2019-03-07)


### Bug Fixes

* **webpack:** make validation work after hmr ([6f498b2](https://github.com/untool/untool/commit/6f498b2))





# [1.3.0](https://github.com/untool/untool/compare/v1.2.0...v1.3.0) (2019-03-01)

**Note:** Version bump only for package @untool/webpack





# [1.2.0](https://github.com/untool/untool/compare/v1.1.0...v1.2.0) (2019-02-27)


### Bug Fixes

* **webpack:** re-enable node source maps ([3f40319](https://github.com/untool/untool/commit/3f40319))


### Features

* **webpack:** add arg validation to mixin methods ([b17d1a7](https://github.com/untool/untool/commit/b17d1a7))
* **webpack:** allow to ignore url-loader for specific requests ([47ff03a](https://github.com/untool/untool/commit/47ff03a)), closes [xing/hops#557](https://github.com/xing/hops/issues/557)





# [1.1.0](https://github.com/untool/untool/compare/v1.0.0...v1.1.0) (2019-02-14)


### Features

* **webpack:** use `publicPath` in `statsPlugin` ([7134eae](https://github.com/untool/untool/commit/7134eae))





# [1.0.0](https://github.com/untool/untool/compare/v1.0.0-rc.20...v1.0.0) (2019-01-29)

**Note:** Version bump only for package @untool/webpack





# [1.0.0-rc.20](https://github.com/untool/untool/compare/v1.0.0-rc.19...v1.0.0-rc.20) (2019-01-24)


### Bug Fixes

* **webpack:** register webpack specific mixin types ([da8eaf4](https://github.com/untool/untool/commit/da8eaf4))





# [1.0.0-rc.19](https://github.com/untool/untool/compare/v1.0.0-rc.18...v1.0.0-rc.19) (2019-01-22)


### Bug Fixes

* **webpack:** prevent needless rendering ([de2e1c1](https://github.com/untool/untool/commit/de2e1c1))





# [1.0.0-rc.18](https://github.com/untool/untool/compare/v1.0.0-rc.17...v1.0.0-rc.18) (2019-01-18)

**Note:** Version bump only for package @untool/webpack





# [1.0.0-rc.17](https://github.com/untool/untool/compare/v1.0.0-rc.16...v1.0.0-rc.17) (2019-01-17)


### Bug Fixes

* **react:** do not error when importComponent module not found ([af455e3](https://github.com/untool/untool/commit/af455e3))
* **webpack:** derive outfile from strings ([5d43534](https://github.com/untool/untool/commit/5d43534))





# [1.0.0-rc.16](https://github.com/untool/untool/compare/v1.0.0-rc.15...v1.0.0-rc.16) (2019-01-09)


### Bug Fixes

* **webpack:** simplify module/chunk mapping ([b475ef1](https://github.com/untool/untool/commit/b475ef1)), closes [xing/hops#758](https://github.com/xing/hops/issues/758) [/github.com/jamiebuilds/react-loadable/blob/master/src/webpack.js#L18-L20](https://github.com//github.com/jamiebuilds/react-loadable/blob/master/src/webpack.js/issues/L18-L20)





# [1.0.0-rc.15](https://github.com/untool/untool/compare/v1.0.0-rc.14...v1.0.0-rc.15) (2019-01-03)


### Bug Fixes

* remove dependency browserslist-useragent ([a9d987a](https://github.com/untool/untool/commit/a9d987a))
* update dependency file-loader to v3 ([fe4591b](https://github.com/untool/untool/commit/fe4591b))
* update dependency supports-color to v6 ([a8a26ff](https://github.com/untool/untool/commit/a8a26ff))
* **webpack:** ignore child-compilers in RenderPlugin ([7c438ad](https://github.com/untool/untool/commit/7c438ad))





# [1.0.0-rc.14](https://github.com/untool/untool/compare/v1.0.0-rc.13...v1.0.0-rc.14) (2018-12-07)


### Bug Fixes

* **webpack:** use NODE_ENV instead of argument ([8a3dc6a](https://github.com/untool/untool/commit/8a3dc6a))





# [1.0.0-rc.13](https://github.com/untool/untool/compare/v1.0.0-rc.12...v1.0.0-rc.13) (2018-12-05)

**Note:** Version bump only for package @untool/webpack





# [1.0.0-rc.12](https://github.com/untool/untool/compare/v1.0.0-rc.11...v1.0.0-rc.12) (2018-12-03)


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


### Features

* **webpack:** support ESM via ".mjs" ext and "module" package field ([daaeb4b](https://github.com/untool/untool/commit/daaeb4b)), closes [/github.com/webpack/webpack/blob/v4.23.1/lib/WebpackOptionsDefaulter.js#L327-L348](https://github.com//github.com/webpack/webpack/blob/v4.23.1/lib/WebpackOptionsDefaulter.js/issues/L327-L348)


### Performance Improvements

* **webpack:** only re-evaluate config when overrides exist ([ef4a5a8](https://github.com/untool/untool/commit/ef4a5a8))





# [1.0.0-rc.8](https://github.com/untool/untool/compare/v1.0.0-rc.7...v1.0.0-rc.8) (2018-10-23)

**Note:** Version bump only for package @untool/webpack





# [1.0.0-rc.7](https://github.com/untool/untool/compare/v1.0.0-rc.6...v1.0.0-rc.7) (2018-10-21)

**Note:** Version bump only for package @untool/webpack





# [1.0.0-rc.6](https://github.com/untool/untool/compare/v1.0.0-rc.5...v1.0.0-rc.6) (2018-10-17)

**Note:** Version bump only for package @untool/webpack





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

* **webpack:** add ua detection middleware ([838af07](https://github.com/untool/untool/commit/838af07))
* **webpack:** babel everything (except polyfills) ([1a97e1c](https://github.com/untool/untool/commit/1a97e1c))
* **webpack:** introduce getRenderRequests hook ([c1b3141](https://github.com/untool/untool/commit/c1b3141))
* **webpack:** use adaptive module ids ([d4db5da](https://github.com/untool/untool/commit/d4db5da))





# [1.0.0-rc.2](https://github.com/untool/untool/compare/v1.0.0-rc.1...v1.0.0-rc.2) (2018-10-10)

**Note:** Version bump only for package @untool/webpack





# [1.0.0-rc.1](https://github.com/untool/untool/compare/v1.0.0-rc.0...v1.0.0-rc.1) (2018-10-10)

**Note:** Version bump only for package @untool/webpack





# [1.0.0-rc.0](https://github.com/untool/untool/compare/v0.26.0...v1.0.0-rc.0) (2018-10-10)


### Bug Fixes

* **webpack:** allow calling getConfig without arguments ([31f9cc3](https://github.com/untool/untool/commit/31f9cc3))
* **webpack:** bundle everything during node build ([c31a259](https://github.com/untool/untool/commit/c31a259))
* **webpack:** re-introduce config debug output ([ddb0ecd](https://github.com/untool/untool/commit/ddb0ecd))


### Features

* **webpack:** introduce `collectBuildConfigs` hook ([f225655](https://github.com/untool/untool/commit/f225655))
* **webpack:** introduce `getBuildStats` utility hook ([590df85](https://github.com/untool/untool/commit/590df85))





<a name="0.26.0"></a>
# [0.26.0](https://github.com/untool/untool/compare/v0.25.1...v0.26.0) (2018-10-01)


### Bug Fixes

* **webpack:** emit stats file only for parent compilation ([bea1daa](https://github.com/untool/untool/commit/bea1daa))





<a name="0.25.1"></a>
## [0.25.1](https://github.com/untool/untool/compare/v0.25.0...v0.25.1) (2018-09-28)

**Note:** Version bump only for package @untool/webpack





<a name="0.25.0"></a>
# [0.25.0](https://github.com/untool/untool/compare/v0.24.1...v0.25.0) (2018-09-28)


### Bug Fixes

* **webpack:** handle all compile errors ([d2f1dbe](https://github.com/untool/untool/commit/d2f1dbe))


### Features

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





<a name="0.23.0"></a>
# [0.23.0](https://github.com/untool/untool/compare/v0.22.0...v0.23.0) (2018-09-25)


### Features

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

* **webpack:** add server source maps in production ([85b1ef6](https://github.com/untool/untool/commit/85b1ef6))





<a name="0.19.0"></a>
# [0.19.0](https://github.com/untool/untool/compare/v0.18.0...v0.19.0) (2018-09-06)


### Bug Fixes

* **webpack:** fix rendering of multiple locations ([11e7e7f](https://github.com/untool/untool/commit/11e7e7f))





<a name="0.18.0"></a>
# [0.18.0](https://github.com/untool/untool/compare/v0.17.2...v0.18.0) (2018-09-03)


### Bug Fixes

* **webpack:** set source type to 'unambiguous' ([13bc15c](https://github.com/untool/untool/commit/13bc15c))


### Features

* **webpack:** upgrade babel to v7 ([921f149](https://github.com/untool/untool/commit/921f149))





<a name="0.17.2"></a>
## [0.17.2](https://github.com/untool/untool/compare/v0.17.1...v0.17.2) (2018-08-23)


### Bug Fixes

* update dependency file-loader to v2 ([613456b](https://github.com/untool/untool/commit/613456b))
* **webpack:** move assets starting with "vendors~" to the top ([2b65269](https://github.com/untool/untool/commit/2b65269))





<a name="0.17.1"></a>
## [0.17.1](https://github.com/untool/untool/compare/v0.17.0...v0.17.1) (2018-08-20)

**Note:** Version bump only for package @untool/webpack





<a name="0.17.0"></a>
# [0.17.0](https://github.com/untool/untool/compare/v0.16.0...v0.17.0) (2018-08-17)


### Features

* **webpack:** make exports configurable ([dd4c4e8](https://github.com/untool/untool/commit/dd4c4e8))





<a name="0.16.0"></a>
# [0.16.0](https://github.com/untool/untool/compare/v0.15.1...v0.16.0) (2018-08-06)




**Note:** Version bump only for package @untool/webpack

<a name="0.15.1"></a>
## [0.15.1](https://github.com/untool/untool/compare/v0.15.0...v0.15.1) (2018-08-03)




**Note:** Version bump only for package @untool/webpack

<a name="0.15.0"></a>
# [0.15.0](https://github.com/untool/untool/compare/v0.14.2...v0.15.0) (2018-08-02)




**Note:** Version bump only for package @untool/webpack

<a name="0.14.2"></a>
## [0.14.2](https://github.com/untool/untool/compare/v0.14.1...v0.14.2) (2018-08-01)




**Note:** Version bump only for package @untool/webpack

<a name="0.14.1"></a>
## [0.14.1](https://github.com/untool/untool/compare/v0.14.0...v0.14.1) (2018-07-26)




**Note:** Version bump only for package @untool/webpack

<a name="0.14.0"></a>
# [0.14.0](https://github.com/untool/untool/compare/v0.13.0...v0.14.0) (2018-07-25)


### Features

* **webpack:** protect `{server,asset}File` from access ([ad2db65](https://github.com/untool/untool/commit/ad2db65)), closes [#86](https://github.com/untool/untool/issues/86)




<a name="0.13.0"></a>
# [0.13.0](https://github.com/untool/untool/compare/v0.12.1...v0.13.0) (2018-07-17)


### Features

* **webpack:** expose getBuildConfig hook ([0094d32](https://github.com/untool/untool/commit/0094d32))




<a name="0.12.1"></a>
## [0.12.1](https://github.com/untool/untool/compare/v0.12.0...v0.12.1) (2018-07-09)




**Note:** Version bump only for package @untool/webpack

<a name="0.12.0"></a>
# [0.12.0](https://github.com/untool/untool/compare/v0.11.0...v0.12.0) (2018-07-06)




**Note:** Version bump only for package @untool/webpack

<a name="0.11.0"></a>
# [0.11.0](https://github.com/untool/untool/compare/v0.10.0...v0.11.0) (2018-07-03)


### Bug Fixes

* **webpack:** turn off function inlining to avoid const reassignment ([3c72190](https://github.com/untool/untool/commit/3c72190))


### Features

* **webpack:** add env specific config placeholders ([d4d57e2](https://github.com/untool/untool/commit/d4d57e2))




<a name="0.10.0"></a>
# [0.10.0](https://github.com/untool/untool/compare/v0.9.0...v0.10.0) (2018-06-26)


### Bug Fixes

* update dependency babel-plugin-dynamic-import-node to v2 ([872dccc](https://github.com/untool/untool/commit/872dccc))




<a name="0.9.0"></a>
# [0.9.0](https://github.com/untool/untool/compare/v0.8.2...v0.9.0) (2018-06-25)




**Note:** Version bump only for package @untool/webpack

<a name="0.8.2"></a>
## [0.8.2](https://github.com/untool/untool/compare/v0.8.1...v0.8.2) (2018-06-21)




**Note:** Version bump only for package @untool/webpack

<a name="0.8.1"></a>
## [0.8.1](https://github.com/untool/untool/compare/v0.8.0...v0.8.1) (2018-06-18)


### Bug Fixes

* update dependency find-up to v3 ([ffe0f89](https://github.com/untool/untool/commit/ffe0f89))




<a name="0.8.0"></a>
# [0.8.0](https://github.com/untool/untool/compare/v0.7.0...v0.8.0) (2018-06-13)


### Features

* **webpack:** enable node source map support in production ([7f12126](https://github.com/untool/untool/commit/7f12126))
* **webpack:** improve error handling ([77fe413](https://github.com/untool/untool/commit/77fe413))




<a name="0.7.0"></a>
# [0.7.0](https://github.com/untool/untool/compare/v0.4.0...v0.7.0) (2018-06-05)


### Bug Fixes

* update dependency style-loader to ^0.21.0 ([3ad2cf6](https://github.com/untool/untool/commit/3ad2cf6))
* **webpack:** "rootDir" must point to a directory, not the package.json ([f151444](https://github.com/untool/untool/commit/f151444))
* **webpack:** do not use css optimizations that assume concatenation ([92366b1](https://github.com/untool/untool/commit/92366b1))
* **webpack:** fix ES module detection by applying duck typing ([40a5992](https://github.com/untool/untool/commit/40a5992))
* **webpack:** fix node externals detection ([87c12fc](https://github.com/untool/untool/commit/87c12fc))
* **webpack:** include all file-relative requests in bundle ([3c35cc7](https://github.com/untool/untool/commit/3c35cc7))
* **webpack:** make ESM-style runtime mixins work ([c5bea5e](https://github.com/untool/untool/commit/c5bea5e))
* **webpack:** prevent hmr chunks from being inserted into the template ([86dbf12](https://github.com/untool/untool/commit/86dbf12))
* **webpack:** remove ESM support from loader configs ([4cba48f](https://github.com/untool/untool/commit/4cba48f))
* **webpack:** use chunkhash in filenames ([4340e38](https://github.com/untool/untool/commit/4340e38))


### Features

* **webpack:** add untool/webpack main export ([53c4243](https://github.com/untool/untool/commit/53c4243))
* **webpack:** swap out cssnext for preset-env ([6fa880e](https://github.com/untool/untool/commit/6fa880e))




<a name="0.6.0"></a>
# [0.6.0](https://github.com/untool/untool/compare/v0.5.1...v0.6.0) (2018-05-16)


### Bug Fixes

* **webpack:** "rootDir" must point to a directory, not the package.json ([f151444](https://github.com/untool/untool/commit/f151444))
* **webpack:** include all file-relative requests in bundle ([3c35cc7](https://github.com/untool/untool/commit/3c35cc7))


### Features

* **webpack:** add untool/webpack main export ([53c4243](https://github.com/untool/untool/commit/53c4243))




<a name="0.5.1"></a>
## [0.5.1](https://github.com/untool/untool/compare/v0.5.0...v0.5.1) (2018-05-14)


### Bug Fixes

* **webpack:** fix ES module detection by applying duck typing ([40a5992](https://github.com/untool/untool/commit/40a5992))
* **webpack:** fix node externals detection ([87c12fc](https://github.com/untool/untool/commit/87c12fc))




<a name="0.5.0"></a>
# [0.5.0](https://github.com/untool/untool/compare/v0.4.3...v0.5.0) (2018-05-07)


### Bug Fixes

* **webpack:** do not use css optimizations that assume concatenation ([92366b1](https://github.com/untool/untool/commit/92366b1))




<a name="0.4.3"></a>
## [0.4.3](https://github.com/untool/untool/compare/v0.4.2...v0.4.3) (2018-04-24)




**Note:** Version bump only for package @untool/webpack

<a name="0.4.2"></a>
## [0.4.2](https://github.com/untool/untool/compare/v0.4.1...v0.4.2) (2018-04-20)


### Bug Fixes

* **webpack:** use chunkhash in filenames ([4340e38](https://github.com/untool/untool/commit/4340e38))




<a name="0.4.1"></a>
## [0.4.1](https://github.com/untool/untool/compare/v0.4.0...v0.4.1) (2018-04-20)


### Bug Fixes

* **webpack:** prevent hmr chunks from being inserted into the template ([86dbf12](https://github.com/untool/untool/commit/86dbf12))
* **webpack:** remove ESM support from loader configs ([4cba48f](https://github.com/untool/untool/commit/4cba48f))
* update dependency style-loader to ^0.21.0 ([3ad2cf6](https://github.com/untool/untool/commit/3ad2cf6))




<a name="0.4.0"></a>
# [0.4.0](https://github.com/untool/untool/compare/v0.3.2...v0.4.0) (2018-04-16)


### Features

* **webpack:** disable minification for node ([100fdf9](https://github.com/untool/untool/commit/100fdf9))
* **webpack:** enable fully automatic chunking ([f19d0b2](https://github.com/untool/untool/commit/f19d0b2))
* **webpack:** move server build handling to webpack ([13e9f39](https://github.com/untool/untool/commit/13e9f39))




<a name="0.3.2"></a>
## [0.3.2](https://github.com/untool/untool/compare/v0.3.1...v0.3.2) (2018-03-24)


### Bug Fixes

* **webpack:** add missing dependency, fix babel-preset-env ([312fd1c](https://github.com/untool/untool/commit/312fd1c))




<a name="0.3.1"></a>
## [0.3.1](https://github.com/untool/untool/compare/v0.3.0...v0.3.1) (2018-03-24)




**Note:** Version bump only for package @untool/webpack

<a name="0.3.0"></a>
# 0.3.0 (2018-03-22)


### Features

* use minimatch for rewriting ([7ce6725](https://github.com/untool/untool/commit/7ce6725))
