'use strict';

const { readFileSync: readFile } = require('fs');
const { join } = require('path');

const { createServer: createHTTPServer } = require('http');
const { createServer: createHTTPSServer } = require('https');

const portfinder = require('portfinder');

const createServer = (app, https) =>
  https
    ? createHTTPSServer(
        {
          key: readFile(
            https.keyFile || join(__dirname, 'ssl', 'localhost.key')
          ),
          cert: readFile(
            https.certFile || join(__dirname, 'ssl', 'localhost.cert')
          ),
        },
        app
      )
    : createHTTPServer(app);

const getPort = (port) => {
  if (port) return Promise.resolve(port);
  portfinder.basePort = 8080;
  return portfinder.getPortPromise();
};

module.exports = (app, { config, inspectServer, handleError }) => {
  const { host, port, https } = config;
  const server = createServer(app, https);
  getPort(port).then((port) =>
    server.listen(port, host, (error) => {
      if (error) {
        server.close();
        handleError(error);
      } else {
        inspectServer(server);
      }
    })
  );
};
