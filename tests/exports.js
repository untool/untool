const test = require('ava');

const { normalizeArgTypes } = require('./helpers/normalize');

test('basic package exports', (t) => {
  t.snapshot(normalizeArgTypes(require('@untool/core')));
  t.snapshot(normalizeArgTypes(require('@untool/express')));
  t.snapshot(normalizeArgTypes(require('@untool/react')));
  t.snapshot(normalizeArgTypes(require('@untool/webpack')));
  t.snapshot(normalizeArgTypes(require('@untool/yargs')));
});
