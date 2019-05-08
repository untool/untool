const test = require('ava');

const run = require('./helpers/run');

test.before((t) => (t.context.runPromise = run('build')));

test('core lifecycle hooks', (t) =>
  t.context.runPromise.then((api) =>
    Promise.all([
      api.getArgTypes('constructor').then((args) => t.snapshot(args)),
      api.getArgTypes('registerCommands').then((args) => t.snapshot(args)),
      api.getArgTypes('handleArguments').then((args) => t.snapshot(args)),
      api.getArgTypes('configureBuild').then((args) => t.snapshot(args)),

      api.getMixin().then((mixin) => t.snapshot(mixin)),
      api.getConfig().then((config) => t.snapshot(config)),

      api.getWebpackConfig('build').then((config) => t.snapshot(config)),
      api.getWebpackConfig('node').then((config) => t.snapshot(config)),

      api.getArtefacts().then((artefacts) => t.snapshot(artefacts)),
    ])
  ));
