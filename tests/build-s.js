const test = require('ava');

const run = require('./helpers/run');
const serve = require('./helpers/serve');

test('core lifecycle hooks', (t) =>
  run('build', '-s').then((api) =>
    Promise.all([
      api.getArgTypes('constructor').then((args) => t.snapshot(args)),
      api.getArgTypes('registerCommands').then((args) => t.snapshot(args)),
      api.getArgTypes('handleArguments').then((args) => t.snapshot(args)),
      api.getArgTypes('configureServer').then((args) => t.snapshot(args)),
      api.getArgTypes('configureWebpack').then((args) => t.snapshot(args)),

      api.getMixin().then((mixin) => t.snapshot(mixin)),
      api.getConfig().then((config) => t.snapshot(config)),

      api.getWebpackConfig('build').then((config) => t.snapshot(config)),
      api.getWebpackConfig('node').then((config) => t.snapshot(config)),

      api.getArtefacts().then((artefacts) => t.snapshot(artefacts)),
    ])
  ));

test('server lifecycle hooks', (t) =>
  serve('build', '-s').then((api) =>
    Promise.all([
      api.getArgTypes('constructor').then((args) => t.snapshot(args)),
      api.getArgTypes('bootstrap').then((args) => t.snapshot(args)),
      api.getArgTypes('enhanceElement').then((args) => t.snapshot(args)),
      api.getArgTypes('fetchData').then((args) => t.snapshot(args)),

      api.getMixin().then((mixin) => t.snapshot(mixin)),
      api.getConfig().then((config) => t.snapshot(config)),
    ])
  ));
