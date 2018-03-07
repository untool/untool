const { readFileSync } = require('fs');
const { join } = require('path');
const { format } = require('url');

const { createServer: createHTTPServer } = require('http');
const { createServer: createHTTPSServer } = require('https');

module.exports = (app, core, config) => {
  let server;
  if (config.https) {
    server = createHTTPSServer(
      {
        key: readFileSync(
          config.https.keyFile || join(__dirname, 'ssl', 'localhost.key')
        ),
        cert: readFileSync(
          config.https.certFile || join(__dirname, 'ssl', 'localhost.cert')
        ),
      },
      app
    );
  } else {
    server = createHTTPServer(app);
  }
  server.listen(config.port, config.host, error => {
    if (error) {
      core.logError(error);
    } else {
      core.logInfo(
        'server listening at ' +
          format({
            protocol: config.https ? 'https' : 'http',
            hostname: config.host === '0.0.0.0' ? 'localhost' : config.host,
            port: config.port,
            pathname: config.basePath,
          })
      );
    }
  });
  return server;
};
