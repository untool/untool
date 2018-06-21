const test = require('ava');

const prepare = require('./helpers/prepare');

test('core lifecycle hooks', (t) =>
  prepare('serve').then((api) =>
    Promise.all([
      api.getArgTypes('constructor').then((args) => t.snapshot(args)),
      api.getArgTypes('registerCommands').then((args) => t.snapshot(args)),
      api.getArgTypes('handleArguments').then((args) => t.snapshot(args)),
      api.getArgTypes('configureServer').then((args) => t.snapshot(args)),
      api.getArgTypes('inspectServer').then((args) => t.snapshot(args)),

      api.navigate('/').then((res) => t.snapshot(res)),
    ])
  ));
