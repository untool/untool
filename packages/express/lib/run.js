const { readFileSync } = require('fs');
const { join } = require('path');
const { format } = require('url');

const { createServer: createNetServer } = require('net');
const { createServer: createHTTPServer } = require('http');
const { createServer: createHTTPSServer } = require('https');

const getPort = (ip, port, max) =>
  new Promise((resolve, reject) => {
    max = max || Math.min(65535, port + 50);
    if (port > max) {
      return reject(new Error('unable to find free port'));
    }
    const server = createNetServer();
    server.on('error', () => {
      resolve(getPort(ip, port + 1, max));
      server.close();
    });
    server.listen(port, ip, () => {
      server.once('close', () => resolve(port));
      server.close();
    });
  });

module.exports = (app, core, config) => {
  const { port, ip, basePath, https, findPort } = config;
  const server = https
    ? createHTTPSServer(
        {
          key: readFileSync(
            https.keyFile || join(__dirname, 'ssl', 'localhost.key')
          ),
          cert: readFileSync(
            https.certFile || join(__dirname, 'ssl', 'localhost.cert')
          ),
        },
        app
      )
    : createHTTPServer(app);
  (findPort ? getPort(ip, port) : Promise.resolve(port)).then(port =>
    server.listen(port, ip, error => {
      if (error) {
        core.logError(error);
        server.close();
      } else {
        core.inspectServer(server);
        core.logInfo(
          'server listening at %s',
          format({
            protocol: https ? 'https' : 'http',
            hostname: ['0.0.0.0', '127.0.0.1'].includes(ip) ? 'localhost' : ip,
            pathname: basePath,
            port,
          })
        );
      }
    })
  );
};
