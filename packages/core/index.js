module.exports = require('@std/esm')(module, {
  esm: 'js',
  cjs: {
    interop: true,
    namedExports: true,
    vars: true,
  },
})('./lib/core');
