const { promisify } = require('util');
const { exec: execAsync, execFile: execFileAsync } = require('child_process');

const exec = promisify(execAsync);
const execFile = promisify(execFileAsync);

const execute = (command, ...args) =>
  exec(`which ${command}`).then(({ stdout, stderr }) => {
    if (stderr) {
      throw new Error(stderr);
    }
    return execFile(stdout.replace(/\s+$/, ''), args).then(
      ({ stdout, stderr }) => {
        if (stderr) {
          throw new Error(stderr);
        }
        return stdout;
      }
    );
  });

const executeNpm = (...args) => execute('npm', ...args);
const executeYarn = (...args) => execute('yarn', ...args);

exports.init = () => executeNpm('init', '--force');

exports.info = module => executeNpm('info', '--json', module).then(JSON.parse);

exports.search = (...queries) =>
  executeNpm('search', '--json', ...queries).then(JSON.parse);

exports.install = (...modules) =>
  executeYarn('add', ...modules).catch(() =>
    executeNpm('install', '--save-prod', ...modules)
  );

exports.getPeerDependencies = (...modules) =>
  modules.reduce(
    (promise, module) =>
      promise.then(dependencies =>
        exports
          .info(module)
          .then(info => ({ ...dependencies, ...info.peerDependencies }))
      ),
    Promise.resolve({})
  );

exports
  .getPeerDependencies('hops-react', 'hops-redux')
  .then(console.log.bind(console))
  .catch(console.log.bind(console));
