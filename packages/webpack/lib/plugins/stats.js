'use strict';

const { RawSource } = require('webpack-sources');

exports.StatsPlugin = class WebpackStatsPlugin {
  constructor({ stats: resolvable }) {
    this.apply = (compiler) => {
      compiler.hooks.emit.tap('untool-stats', (compilation) => {
        const stats = compilation.getStats().toJson();
        const moduleIds = {};
        compilation.chunks.forEach((chunk) => {
          for (const module of chunk.modulesIterable) {
            let currentModule = module;
            if (module.constructor.name === 'ConcatenatedModule') {
              currentModule = module.rootModule;
            }
            moduleIds[currentModule.rawRequest] = module.id;
          }
        });
        resolvable.resolve({ ...stats, moduleIds });
      });
      compiler.hooks.watchRun.tap('untool-stats', () => resolvable.reset());
    };
  }
};

exports.StatsFilePlugin = class WebpackStatsFilePlugin {
  constructor({ stats: resolvable, config: { statsFile } }) {
    this.apply = (compiler) => {
      compiler.hooks.emit.tapPromise('untool-stats', ({ assets }) =>
        resolvable.then(
          (stats) => (assets[statsFile] = new RawSource(JSON.stringify(stats)))
        )
      );
    };
  }
};
