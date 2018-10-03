'use strict';

const EventEmitter = require('events');

const { createMocks } = require('node-mocks-http');

module.exports = (app) => (options) =>
  new Promise((resolve, reject) => {
    const { req, res } = createMocks(
      typeof options === 'string' ? { url: options } : options,
      { eventEmitter: EventEmitter }
    );
    res.on('finish', () => {
      if (res.statusCode !== 200) {
        reject(new Error(`Received status ${res.statusCode} for: ${req.url}`));
      } else {
        resolve(res._getData());
      }
    });
    app.handle(req, res, (error) => {
      reject(error || new Error(`Can't get response for: ${req.url}`));
    });
  });
