'use strict';

const { readFileSync: readFile } = require('fs');
const { join } = require('path');

const { createServer: createHTTPServer } = require('http');
const { createServer: createHTTPSServer } = require('https');

const portfinder = require('portfinder');

const defaultKeyFile = join(__dirname, 'ssl', 'localhost.key');
const defaultCertFile = join(__dirname, 'ssl', 'localhost.cert');

const createServer = (app, https) => {
  if (https) {
    const { keyFile, certFile } = https;
    const key = readFile(keyFile || defaultKeyFile);
    const cert = readFile(certFile || defaultCertFile);
    return createHTTPSServer({ key, cert }, app);
  }
  return createHTTPServer(app);
};

const shutdownServer = (server, { locals }, { gracePeriod }) => {
  const timeoutPromise = new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error('timeout')), gracePeriod)
  );
  if (!locals.shuttingDown) {
    locals.shuttingDown = true;
    server.emit('shutdown');
    return Promise.race([
      timeoutPromise,
      new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
      ),
    ]);
  }
  return timeoutPromise;
};

const getPort = (port) => {
  portfinder.basePort = 8080;
  return port ? Promise.resolve(port) : portfinder.getPortPromise();
};

module.exports = (app, { config, inspectServer, handleError }) => {
  const { domain } = app.locals;
  const { host, port, https } = config;
  const server = createServer(app, https);
  domain.on('error', (error) =>
    shutdownServer(server, app, config).then(
      () => handleError(error),
      () => handleError(error)
    )
  );
  process.on('SIGTERM', () =>
    shutdownServer(server, app, config).then(
      () => process.exit(),
      (error) => handleError(error)
    )
  );
  getPort(port).then(
    (port) =>
      server.listen(port, host, (error) => {
        if (error) {
          server.close();
          handleError(error);
        } else {
          inspectServer(server);
        }
      }),
    handleError
  );
};
