const EventEmitter = require('events');

const mocks = require('node-mocks-http');

module.exports = (app) => (options) =>
  new Promise((resolve, reject) => {
    if (typeof options === 'string') {
      options = { url: options };
    }
    const req = mocks.createRequest(options);
    const res = mocks.createResponse({
      eventEmitter: EventEmitter,
      request: req,
    });
    res.on('finish', () => {
      if (res.statusCode !== 200) {
        reject(new Error(`invalid status code: ${res.statusCode}`));
      } else {
        resolve(res._getData());
      }
    });
    app.handle(req, res, (error) => {
      reject(error || new Error(`no response for: ${req.url}`));
    });
  });
