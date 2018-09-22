'use strict';

const { RawSource } = require('webpack-sources');

exports.StatsPlugin = class WebpackStatsPlugin {
  constructor({ stats: resolvable }) {
    this.apply = (compiler) => {
      compiler.hooks.emit.tap('untool-stats', (compilation) => {
        const stats = compilation.getStats().toJson();
        const moduleIdMap = {};
        const moduleChunkMap = {};
        compilation.chunks.forEach((chunk) => {
          for (const module of chunk.modulesIterable) {
            let currentModule = module;
            if (module.constructor.name === 'ConcatenatedModule') {
              currentModule = module.rootModule;
            }
            moduleIdMap[currentModule.rawRequest] = module.id;
            moduleChunkMap[module.id] = chunk.id;
          }
        });
        const moduleDepIds = stats.modules.reduce(
          (result, { id }) => ({
            ...result,
            [id]: (function getAllModuleIds(moduleIds) {
              const depModuleIds = stats.modules.reduce(
                (result, { id, reasons }) =>
                  !moduleIds.includes(id) &&
                  reasons.find(({ moduleId }) => moduleIds.includes(moduleId))
                    ? result.concat(id)
                    : result,
                []
              );
              if (depModuleIds.length) {
                return getAllModuleIds(moduleIds.concat(depModuleIds));
              }
              return moduleIds;
            })([id]),
          }),
          {}
        );
        const additions = { moduleIdMap, moduleChunkMap, moduleDepIds };
        resolvable.resolve({ ...stats, ...additions });
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
