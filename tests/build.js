const test = require('ava');

const run = require('./helpers/run');

test('core lifecycle hooks', t =>
  run('build').then(api =>
    Promise.all([
      api.getArgTypes('constructor').then(args => t.snapshot(args)),
      api.getArgTypes('registerCommands').then(args => t.snapshot(args)),
      api.getArgTypes('handleArguments').then(args => t.snapshot(args)),
      api.getArgTypes('configureWebpack').then(args => t.snapshot(args)),

      api.getMixin().then(mixin => t.snapshot(mixin)),
      api.getConfig().then(config => t.snapshot(config)),

      api.getWebpackConfig('build').then(config => t.snapshot(config)),
      api.getWebpackConfig('node').then(config => t.snapshot(config)),

      api.getArtefacts().then(artefacts => t.snapshot(artefacts)),
    ])
  ));
