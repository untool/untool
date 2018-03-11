const EventEmitter = require('events');

module.exports = class Promiser extends EventEmitter {
  promise(topic, resolver) {
    return new Promise((resolve, reject) =>
      this.once(topic, resolver ? resolver(resolve, reject) : resolve)
    );
  }
  promiseArg(topic, index) {
    return this.promise(topic, resolve => (...args) => resolve(args[index]));
  }
  promiseArgs(topic) {
    return this.promise(topic, resolve => (...args) => resolve(args));
  }
};
