const { promisify } = require('util');
const { readFile: readFileAsync, writeFile: writeFileAsync } = require('fs');

const readFile = promisify(readFileAsync);
const writeFile = promisify(writeFileAsync);

module.exports = class PackageFile {
  constructor(pkgFile) {
    this.pkgFile = pkgFile;
    this.pkgData = null;
  }
  promise() {
    return this.pkgData
      ? Promise.resolve(this.pkgData)
      : readFile(this.pkgFile).then(json => (this.pkgData = JSON.parse(json)));
  }
  commit() {
    return this.promise().then(data => {
      this.pkgData = null;
      return writeFile(this.pkgFile, JSON.stringify(data, null, 2));
    });
  }
  get(...args) {
    return this.promise().then(data =>
      args.reduce(
        (result, arg) => (result && arg in result ? result[arg] : null),
        data
      )
    );
  }
  set(...args) {
    const value = args.pop();
    const key = args.pop();
    return this.promise()
      .then(data => {
        const container = args.reduce(
          (result, arg) => (arg in result ? result[arg] : (result[arg] = {})),
          data
        );
        container[key] = value;
      })
      .then(() => this.commit());
  }
  add(...args) {
    const value = args.pop();
    return this.get(...args)
      .then(array => (Array.isArray(array) ? array : []).concat(value))
      .then(value => this.set(...args, value));
  }
};
