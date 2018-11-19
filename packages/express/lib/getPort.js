const portfinder = require('portfinder');

module.exports = function getPort(port) {
  if (port) return Promise.resolve(port);
  portfinder.basePort = 8080;
  return portfinder.getPortPromise();
};
