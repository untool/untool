const { readFileSync: readFile } = require('fs');
const { join } = require('path');
const { format } = require('url');

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

const findPort = (ip, port, max) =>
  new Promise((resolve, reject) => {
    max = max || Math.min(65535, port + 50);
    if (port > max) {
      reject(new Error('unable to open free port'));
    } else {
      process.nextTick(() => {
        const server = createNetServer().unref();
        server.on('error', () => resolve(findPort(ip, port + 1, max)));
        server.listen(port, ip, () => server.close(() => resolve(port)));
      });
    }
  });

const getPort = (ip, port) =>
  findPort(ip, ...(Array.isArray(port) ? port : [port || 8080, port]));

module.exports = (app, config, inspect, logInfo, logError) => {
  const { ip = '0.0.0.0', port, basePath, https } = config;
  const server = createServer(app, https);
  getPort(ip, port).then(port =>
    server.listen(port, ip, error => {
      if (error) {
        logError(error);
        server.close();
      } else {
        inspect(server);
        logInfo(
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
