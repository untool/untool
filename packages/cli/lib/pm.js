const { promisify } = require('util');
const { exec: execAsync, execFile: execFileAsync } = require('child_process');

const exec = promisify(execAsync);
const execFile = promisify(execFileAsync);

const execute = (command, ...args) =>
  exec(`which ${command}`).then(({ stdout }) =>
    execFile(stdout.replace(/\s+$/, ''), args).then(({ stdout }) => stdout)
  );

exports.init = () => execute('npm', 'init', '--yes');

exports.info = module =>
  execute('npm', 'info', '--json', module).then(JSON.parse);

exports.search = (...queries) =>
  execute('npm', 'search', '--json', ...queries).then(JSON.parse);

exports.install = (...modules) =>
  modules
    .reduce(
      (promise, module) =>
        promise.then(deps =>
          exports
            .info(module)
            .then(info => ({ ...deps, ...info.peerDependencies }))
        ),
      Promise.resolve({})
    )
    .then(deps => Object.keys(deps).map(key => `${key}@${deps[key]}`))
    .then(deps =>
      execute('yarn', 'add', ...modules, ...deps).catch(() =>
        execute('npm', 'install', '--save-prod', ...modules, ...deps)
      )
    );
