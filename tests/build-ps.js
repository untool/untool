const test = require('ava');

const run = require('./helpers/run');
const serve = require('./helpers/serve');

test.before((t) => (t.context.runPromise = run('build', '-ps')));

test('core lifecycle hooks', (t) =>
  t.context.runPromise.then((api) =>
    Promise.all([
      api.getArgTypes('constructor').then((args) => t.snapshot(args)),
      api.getArgTypes('registerCommands').then((args) => t.snapshot(args)),
      api.getArgTypes('handleArguments').then((args) => t.snapshot(args)),
      api.getArgTypes('configureServer').then((args) => t.snapshot(args)),
      api.getArgTypes('configureBuild').then((args) => t.snapshot(args)),

      api.getMixin().then((mixin) => t.snapshot(mixin)),
      api.getConfig().then((config) => t.snapshot(config)),

      api.getWebpackConfig('browser').then((config) => t.snapshot(config)),
      api.getWebpackConfig('node').then((config) => t.snapshot(config)),

      api.getArtefacts().then((artefacts) => t.snapshot(artefacts)),
    ])
  ));

test('server lifecycle hooks', (t) =>
  serve(t.context.runPromise).then((api) =>
    Promise.all([
      api.getArgTypes('constructor').then((args) => t.snapshot(args)),
      api.getArgTypes('bootstrap').then((args) => t.snapshot(args)),
      api.getArgTypes('enhanceElement').then((args) => t.snapshot(args)),
      api.getArgTypes('fetchData').then((args) => t.snapshot(args)),
      api.getArgTypes('getTemplateData').then((args) => t.snapshot(args)),

      api.getMixin().then((mixin) => t.snapshot(mixin)),
      api.getConfig().then((config) => t.snapshot(config)),
    ])
  ));
