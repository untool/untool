import EventEmitter from 'events';

import { Router } from 'express';
import mocks from 'node-mocks-http';

export default (options, core) => {
  const app = new Router();
  core.initializeServer(app, 'static');
  core.optimizeServer(app, 'static');
  core.finalizeServer(app, 'static');
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
