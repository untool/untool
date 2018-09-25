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
            moduleChunkMap[module.id] = chunk;
          }
        });
        const getDepModuleIds = (id) =>
          (function getAllModuleIds(moduleIds) {
            const depModuleIds = stats.modules.reduce(
              (result, { id, chunks, reasons }) =>
                !moduleIds.includes(id) &&
                chunks.length &&
                reasons.find(({ moduleId }) => moduleIds.includes(moduleId))
                  ? result.concat(id)
                  : result,
              []
            );
            if (depModuleIds.length) {
              return getAllModuleIds(moduleIds.concat(depModuleIds));
            }
            return moduleIds;
          })([id]);
        const moduleFileMap = Object.keys(moduleIdMap).reduce(
          (result, rawRequest) => ({
            ...result,
            [rawRequest]: getDepModuleIds(moduleIdMap[rawRequest])
              .reduce(
                (result, moduleId) =>
                  result.concat(moduleChunkMap[moduleId].files),
                []
              )
              .filter((file, index, self) => self.indexOf(file) === index),
          }),
          {}
        );
        const entryChunks = stats.chunks.filter(({ entry }) => entry);
        const vendorChunks = stats.chunks.filter(({ id }) =>
          entryChunks.find(({ siblings }) => siblings.includes(id))
        );
        const entryFiles = entryChunks.reduce(
          (result, { files }) => result.concat(files),
          []
        );
        const vendorFiles = vendorChunks.reduce(
          (result, { files }) => result.concat(files),
          []
        );
        resolvable.resolve({
          ...stats,
          ...{ moduleFileMap, entryFiles, vendorFiles },
        });
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
