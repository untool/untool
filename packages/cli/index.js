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
        message: `Initialize ${basename(process.cwd())} as new untool project?`,
        default: false,
      },
    ])
    .then(({ init }) => init || process.exit(0))
    .then(log('! Initializing project...'))
    .then(() => pm.init())
    .then(() => new Manifest(`${process.cwd()}/package.json`));

const installUntool = manifest =>
  inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'defaults',
        message: `Install untool default preset?`,
        default: true,
      },
    ])
    .then(
      ({ defaults }) =>
        defaults
          ? { presets: ['@untool/defaults'], mixins: [] }
          : Promise.resolve()
              .then(log('! Looking up presets and modules...'))
              .then(() =>
                Promise.all([
                  pm.search('keywords:unpreset'),
                  pm.search('keywords:unmixin'),
                ]).then(([allPresets, allMixins]) =>
                  inquirer.prompt([
                    {
                      type: 'checkbox',
                      name: 'presets',
                      message: 'What presets do you want to install?',
                      choices: allPresets.map(({ name }) => ({ name })),
                    },
                    {
                      type: 'checkbox',
                      name: 'mixins',
                      message: 'What mixins do you want to install?',
                      choices: allMixins.map(({ name }) => ({ name })),
                    },
                  ])
                )
              )
    )
    .then(log('! Installing (this may take a while)...'))
    .then(({ presets, mixins }) =>
      pm
        .install(...presets, ...mixins)
        .then(() => manifest.add('untool', 'presets', presets))
        .then(() => manifest.add('untool', 'mixins', mixins))
    )
    .then(() =>
      resolve(process.cwd(), '@untool/yargs').then(
        untoolYargs => require(untoolYargs),
        () => {
          // eslint-disable-next-line no-console
          console.error('\n', '/o\\ @untool/yargs not found. Exiting.', '\n');
          process.exit(1);
        }
      )
    )
    .then(log('\n', '\\o/ All done!', '\n'));

findUp('package.json')
  .then(pkgFile => (pkgFile ? new Manifest(pkgFile) : createManifest()))
  .then(manifest =>
    resolve(dirname(manifest.pkgFile), '@untool/yargs').then(
      untoolYargs => require(untoolYargs),
      () => installUntool(manifest)
    )
  )
  .then(untoolYargs => untoolYargs.run())
  .catch(error => {
    // eslint-disable-next-line no-console
    console.error(error.stack ? error.stack.toString() : error.toString());
    process.exit(1);
  });
