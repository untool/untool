#!/usr/bin/env node
'use strict';

const { promisify } = require('util');
const { basename, dirname } = require('path');

const findUp = require('find-up');
const inquirer = require('inquirer');
const resolve = promisify(require('enhanced-resolve'));

const Manifest = require('./lib/pkg');
const pm = require('./lib/pm');

const log = (...messages) => result => {
  // eslint-disable-next-line no-console
  console.log(...messages);
  return result;
};

const createManifest = () =>
  inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'init',
        message: `Set up ${basename(process.cwd())} as new project?`,
        default: false,
      },
    ])
    .then(answers => answers.init || process.exit(0))
    .then(log('! Initializing project...'))
    .then(() => pm.init())
    .then(() => new Manifest(`${process.cwd()}/package.json`));

const installUntool = manifest =>
  inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'install',
        message: `Install untool in ${basename(process.cwd())}?`,
        default: true,
      },
    ])
    .then(answers => answers.install || process.exit(0))
    .then(log('! Looking up presets and modules...'))
    .then(() =>
      Promise.all([
        pm.search('scope:untool', 'preset'),
        pm.search('scope:untool', 'plugin'),
      ]).then(([allPresets, allPlugins]) =>
        inquirer
          .prompt([
            {
              type: 'checkbox',
              name: 'presets',
              message: 'What presets do you want to install?',
              choices: allPresets.map(({ name }) => ({ name })),
            },
            {
              type: 'checkbox',
              name: 'plugins',
              message: 'What plugins do you want to install?',
              choices: allPlugins.map(({ name }) => ({ name })),
            },
          ])
          .then(log('! Installing (this may take a while)...'))
          .then(({ presets, plugins }) =>
            pm
              .install(...presets, ...plugins)
              .then(() => manifest.add('untool', 'presets', presets))
              .then(() => manifest.add('untool', 'plugins', plugins))
              .then(() =>
                resolve(process.cwd(), '@untool/core').then(
                  untoolCore => require(untoolCore),
                  () => {
                    // eslint-disable-next-line no-console
                    console.error('You appear not to have installed anything.');
                    process.exit(1);
                  }
                )
              )
          )
          .then(log('\\o/ All done!'))
      )
    );

findUp('package.json')
  .then(pkgFile => (pkgFile ? new Manifest(pkgFile) : createManifest()))
  .then(manifest =>
    resolve(dirname(manifest.pkgFile), '@untool/core').then(
      untoolCore => require(untoolCore),
      () => installUntool(manifest)
    )
  )
  .then(core => core.initialize())
  .catch(error => {
    // eslint-disable-next-line no-console
    console.error(error.toString());
    process.exit(1);
  });
