const { readFileSync: readFile } = require('fs');
const { join } = require('path');

const { createServer: createNetServer } = require('net');
const { createServer: createHTTPServer } = require('http');
const { createServer: createHTTPSServer } = require('https');

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

const getPort = (host, port) => {
  const findPort = (host, port, max) =>
    new Promise((resolve, reject) => {
      max = max || Math.min(65535, port + 50);
      if (port > max) {
        reject(new Error('unable to open free port'));
      } else {
        process.nextTick(() => {
          const server = createNetServer().unref();
          server.on('error', () => resolve(findPort(host, port + 1, max)));
          server.listen(port, host, () => server.close(() => resolve(port)));
        });
      }
    });
  return findPort(host, ...(Array.isArray(port) ? port : [port || 8080, port]));
};

module.exports = (app, { config, inspectServer, handleError }) => {
  let { host, port, https } = config;
  host = host || '0.0.0.0';
  const server = createServer(app, https);
  getPort(host, port).then((port) =>
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
