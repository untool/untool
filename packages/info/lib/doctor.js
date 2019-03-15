'use strict';

const define = require('mixinable');

const {
  sync: { callable: callable, sequence },
} = define;

const strategies = {
  diagnoseConfig: callable,
  diagnoseDuplicatePackages: callable,
  diagnoseInvalidPackages: callable,
  submitDiagnosis: callable,
  getDiagnoses: (...args) => {
    return sequence(...args).then((results) => [].concat(...results));
  },
  logDiagnoses: sequence,
};

const mixins = [
  require('./diagnoses/config'),
  require('./diagnoses/duplicates'),
  require('./diagnoses/invalids'),
  require('./diagnoses/generic'),
];

exports.createDoctor = define(strategies, mixins);
