const { readFileSync } = require('fs');
const { join } = require('path');
const { format } = require('url');

const { createServer: createNetServer } = require('net');
const { createServer: createHTTPServer } = require('http');
const { createServer: createHTTPSServer } = require('https');

const createServer = (app, https) =>
  https
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

const findPort = (ip, port, max) =>
  new Promise((resolve, reject) => {
    max = max || Math.min(65535, port + 50);
    if (port > max) {
      reject(new Error('unable to find free port'));
    } else {
      const server = createNetServer().unref();
      server.on('error', () => resolve(findPort(ip, port + 1, max)));
      server.listen(port, ip, () => server.close(() => resolve(port)));
    }
  });

const getPort = (ip, port) =>
  findPort(ip, ...(Array.isArray(port) ? port : [port || 8080, port]));

module.exports = (app, core, config) => {
  const { ip = '0.0.0.0', port, basePath, https } = config;
  const server = createServer(app, https);
  getPort(ip, port).then(port =>
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
