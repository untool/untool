'use strict';

const define = require('mixinable');

const {
  sync: { callable, sequence },
} = define;

const strategies = {
  validateConfig: callable,
  detectDuplicatePackages: callable,
  diagnoseInvalidPackages: callable,
  collectResults: callable,
  logResults: sequence,
};

const mixins = [
  require('./diagnoses/config'),
  require('./diagnoses/duplicates'),
  require('./diagnoses/invalids'),
  require('./diagnoses/generic'),
];

exports.createDoctor = define(strategies, mixins);
