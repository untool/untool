const { format } = require('url');

const prettyMS = require('pretty-ms');

module.exports = class CLIMixin {
  constructor(config) {
    this.config = config;
  }
  configureBuild(webpackConfig, loaderConfigs, target) {
    if (target === 'develop') {
      const { name } = this.config;
      webpackConfig.plugins.push({
        apply(compiler) {
          compiler.hooks.done.tap('untool-log-plugin', (stats) => {
            process.stdout.write(
              `${name} built successfully in ${prettyMS(
                stats.endTime - stats.startTime
              )}\n`
            );
          });
        },
      });
    }
    return webpackConfig;
  }
  inspectBuild(stats) {
    const { name } = this.config;
    process.stdout.write(
      `${name} built successfully\n\n${stats.toString({
        colors: false,
        version: false,
        hash: false,
        modules: false,
        entrypoints: false,
        chunks: false,
      })}\n\n`
    );
  }
  inspectServer(server) {
    const { name, https, basePath: pathname } = this.config;
    const { address, port } = server.address();
    const hostname = ['::', '::1', '0.0.0.0', '127.0.0.1'].includes(address)
      ? 'localhost'
      : address;
    const protocol = https ? 'https' : 'http';
    const parts = { protocol, hostname, port, pathname };
    process.stdout.write(`${name} listening at ${format(parts)}\n`);
  }
};
