const EventEmitter = require('events');

const { Router } = require('express');
const mocks = require('node-mocks-http');

module.exports = (method, options, config, initialize, finalize) => {
  const app = new Router();
  initialize(app, method);
  finalize(app, method);
  return options => {
    if (typeof options === 'string') {
      options = { url: options };
    }
    return new Promise((resolve, reject) => {
      const req = mocks.createRequest(options);
      const res = mocks.createResponse({
        eventEmitter: EventEmitter,
        request: req,
      });
      res.on('finish', () => {
        if (res.statusCode !== 200) {
          reject(new Error('invalid status code: ' + res.statusCode));
        } else {
          resolve(res._getData());
        }
      });
      app.handle(req, res, error => {
        if (error) {
          reject(error);
        }
      });
    });
  };
};
