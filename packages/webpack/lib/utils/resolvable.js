'use strict';

exports.Resolvable = class Resolvable {
  constructor(executor) {
    const state = [];
    const queue = [
      (reason, value) => state.splice(0, state.length, reason, value),
    ];
    const promise = () => {
      if (state.length) {
        const [reason, value] = state;
        return reason ? Promise.reject(reason) : Promise.resolve(value);
      } else {
        return new Promise((resolve, reject) => {
          queue.push(function once(reason, value) {
            queue.splice(queue.indexOf(once), 1);
            return reason ? reject(reason) : resolve(value);
          });
        });
      }
    };
    this.reset = (executor) => {
      state.splice(0, state.length);
      if (executor) {
        new Promise((resolve, reject) =>
          executor(resolve, reject, this.reset)
        ).then(this.resolve, this.reject);
      }
    };
    this.resolve = (value) => {
      Promise.resolve(value).then(
        (value) => queue.slice().forEach((fn) => fn(null, value)),
        this.reject
      );
    };
    this.reject = (reason) => {
      queue.slice().forEach((fn) => fn(reason));
    };
    this.then = (onFulfilled, onRejected) => {
      return promise().then(onFulfilled, onRejected);
    };
    this.catch = (onRejected) => {
      return promise().catch(onRejected);
    };
    this.reset(executor);
  }
};
