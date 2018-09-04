'use strict';

exports.Resolvable = class Resolvable {
  constructor() {
    const state = [];
    const queue = [
      (reason, value) => state.splice(0, state.length, reason, value),
    ];
    this.reset = () => {
      state.splice(0, state.length);
    };
    this.resolve = (value) => {
      queue.forEach((fn) => fn(null, value));
    };
    this.reject = (reason) => {
      queue.forEach((fn) => fn(reason));
    };
    this.registerCallback = (callback) => {
      if (state.length) {
        const [reason, value] = state;
        callback(reason, value);
      } else {
        queue.push(function once(reason, value) {
          queue.splice(queue.indexOf(once), 1);
          callback(reason, value);
        });
      }
    };
  }
};
