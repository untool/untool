const test = require('ava');

const run = require('./helpers/run');
const serve = require('./helpers/serve');
const browse = require('./helpers/browse');

test('core lifecycle hooks', (t) =>
  run('start', '-ps').then((api) =>
    Promise.all([
      api.getArgTypes('constructor').then((args) => t.snapshot(args)),
      api.getArgTypes('registerCommands').then((args) => t.snapshot(args)),
      api.getArgTypes('handleArguments').then((args) => t.snapshot(args)),
      api.getArgTypes('initializeServer').then((args) => t.snapshot(args)),
      api.getArgTypes('optimizeServer').then((args) => t.snapshot(args)),
      api.getArgTypes('finalizeServer').then((args) => t.snapshot(args)),
      api.getArgTypes('inspectServer').then((args) => t.snapshot(args)),

      api.getArgTypes('configureWebpack').then((args) => t.snapshot(args)),
      api.getArgTypes('inspectBuild').then((args) => t.snapshot(args)),

      api.getMixin().then((mixin) => t.snapshot(mixin)),
      api.getConfig().then((config) => t.snapshot(config)),

      api.getWebpackConfig('build').then((config) => t.snapshot(config)),
      api.getWebpackConfig('node').then((config) => t.snapshot(config)),
    ])
  ));

test('server lifecycle hooks', (t) =>
  serve('start', '-ps').then((api) =>
    Promise.all([
      api.navigate('/').then((res) => t.snapshot(res)),

      api.getArgTypes('constructor').then((args) => t.snapshot(args)),
      api.getArgTypes('bootstrap').then((args) => t.snapshot(args)),
      api.getArgTypes('enhanceElement').then((args) => t.snapshot(args)),
      api.getArgTypes('fetchData').then((args) => t.snapshot(args)),
      api.getArgTypes('enhanceData').then((args) => t.snapshot(args)),

      api.getMixin().then((mixin) => t.snapshot(mixin)),
      api.getConfig().then((config) => t.snapshot(config)),
    ])
  ));

test('browser lifecycle hooks', (t) =>
  browse('start', '-ps').then((api) =>
    Promise.all([
      api.navigate('/').then((res) => t.snapshot(res)),

      api.getArgTypes('constructor').then((args) => t.snapshot(args)),
      api.getArgTypes('bootstrap').then((args) => t.snapshot(args)),
      api.getArgTypes('enhanceElement').then((args) => t.snapshot(args)),
      api.getArgTypes('fetchData').then((args) => t.snapshot(args)),
      api.getArgTypes('enhanceData').then((args) => t.snapshot(args)),

      api.getMixin().then((mixin) => t.snapshot(mixin)),
      api.getConfig().then((config) => t.snapshot(config)),
    ])
  ));
