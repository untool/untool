const test = require('ava');

const run = require('./helpers/run');
const serve = require('./helpers/serve');
const browse = require('./helpers/browse');

test.before((t) => (t.context.apiPromise = run('start', '-p')));

test('core lifecycle hooks', (t) =>
  t.context.apiPromise.then((api) =>
    Promise.all([
      api.getArgTypes('constructor').then((args) => t.snapshot(args)),
      api.getArgTypes('registerCommands').then((args) => t.snapshot(args)),
      api.getArgTypes('handleArguments').then((args) => t.snapshot(args)),
      api.getArgTypes('configureServer').then((args) => t.snapshot(args)),
      api.getArgTypes('inspectServer').then((args) => t.snapshot(args)),

      api.getArgTypes('configureBuild').then((args) => t.snapshot(args)),
      api.getArgTypes('inspectBuild').then((args) => t.snapshot(args)),

      api.getMixin().then((mixin) => t.snapshot(mixin)),
      api.getConfig().then((config) => t.snapshot(config)),

      api.getWebpackConfig('browser').then((config) => t.snapshot(config)),
      api.getWebpackConfig('node').then((config) => t.snapshot(config)),
    ])
  ));

test('server lifecycle hooks', (t) =>
  serve(t.context.apiPromise).then((api) =>
    Promise.all([
      api.navigate('/').then((res) => t.snapshot(res)),

      api.getArgTypes('constructor').then((args) => t.snapshot(args)),
      api.getArgTypes('bootstrap').then((args) => t.snapshot(args)),
      api.getArgTypes('enhanceElement').then((args) => t.snapshot(args)),
      api.getArgTypes('fetchData').then((args) => t.snapshot(args)),
      api.getArgTypes('getTemplateData').then((args) => t.snapshot(args)),

      api.getMixin().then((mixin) => t.snapshot(mixin)),
      api.getConfig().then((config) => t.snapshot(config)),
    ])
  ));

test('browser lifecycle hooks', (t) =>
  browse(t.context.apiPromise).then((api) =>
    Promise.all([
      api.navigate('/').then((res) => t.snapshot(res)),

      api.getArgTypes('constructor').then((args) => t.snapshot(args)),
      api.getArgTypes('bootstrap').then((args) => t.snapshot(args)),
      api.getArgTypes('enhanceElement').then((args) => t.snapshot(args)),
      api.getArgTypes('fetchData').then((args) => t.snapshot(args)),

      api.getMixin().then((mixin) => t.snapshot(mixin)),
      api.getConfig().then((config) => t.snapshot(config)),
    ])
  ));
