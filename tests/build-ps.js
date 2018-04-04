const test = require('ava');

const run = require('./helpers/run');
const serve = require('./helpers/serve');

test('core lifecycle hooks', t =>
  run('build', '-ps').then(api =>
    Promise.all([
      api.getArgTypes('constructor').then(args => t.snapshot(args)),
      api.getArgTypes('registerCommands').then(args => t.snapshot(args)),
      api.getArgTypes('initializeServer').then(args => t.snapshot(args)),
      api.getArgTypes('finalizeServer').then(args => t.snapshot(args)),
      api.getArgTypes('configureWebpack').then(args => t.snapshot(args)),

      api.getMixin().then(mixin => t.snapshot(mixin)),
      api.getCore().then(core => t.snapshot(core)),
      api.getConfig().then(config => t.snapshot(config)),

      api.getWebpackConfig('build').then(config => t.snapshot(config)),
      api.getWebpackConfig('node').then(config => t.snapshot(config)),

      api.getArtefacts().then(artefacts => t.snapshot(artefacts)),
    ])
  ));

test('server lifecycle hooks', t =>
  serve('build', '-ps').then(api =>
    Promise.all([
      api.getArgTypes('constructor').then(args => t.snapshot(args)),
      api.getArgTypes('bootstrap').then(args => t.snapshot(args)),
      api.getArgTypes('enhanceElement').then(args => t.snapshot(args)),
      api.getArgTypes('fetchData').then(args => t.snapshot(args)),

      api.getMixin().then(mixin => t.snapshot(mixin)),
      api.getCore().then(core => t.snapshot(core)),
      api.getConfig().then(config => t.snapshot(config)),
    ])
  ));
