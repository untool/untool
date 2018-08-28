'use strict';

exports.Resolvable = class Resolvable {
  constructor(executor) {
    const state = [];
    const queue = [(...args) => state.splice(0, state.length, ...args)];
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
    Object.assign(this, {
      reset() {
        state.splice(0, state.length);
      },
      resolve(value) {
        Promise.resolve(value).then(
          (value) => queue.forEach((fn) => fn(null, value)),
          this.reject
        );
      },
      reject(reason) {
        queue.forEach((fn) => fn(reason));
      },
      then(onFulfilled, onRejected) {
        return promise().then(onFulfilled, onRejected);
      },
      catch(onRejected) {
        return promise().catch(onRejected);
      },
    });
    if (executor) {
      new Promise(executor).then(this.resolve, this.reject);
    }
  }
};
