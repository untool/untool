'use strict';

const { dirname } = require('path');

const Ajv = require('ajv');
const findUp = require('find-up');

const detectDuplicates = require('duplitect');

exports.validateInstallation = ({ rootDir }) =>
  findUp('yarn.lock', { cwd: rootDir }).then((lockFile) => {
    const cwd = lockFile ? dirname(lockFile) : rootDir;
    return detectDuplicates(cwd, '@untool/*').then((duplicates) =>
      duplicates.map((duplicate) => `duplicate preset '${duplicate}'`)
    );
  });

exports.validateConfig = (config) => (schema) => {
  const ajv = new Ajv({ allErrors: true });
  if (ajv.validate(schema, config)) {
    return [];
  } else {
    return ajv.errors.map(
      ({ dataPath, message }) => `config${dataPath} ${message}`
    );
  }
};

exports.validateEnv = (env) => (schema) => {
  const ajv = new Ajv({ allErrors: true });
  if (ajv.validate(schema, env)) {
    return [];
  } else {
    return ajv.errors.map(
      ({ dataPath, message }) => `env${dataPath} ${message}`
    );
  }
};
