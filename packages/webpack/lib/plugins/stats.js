'use strict';

const { RawSource } = require('webpack-sources');

exports.StatsPlugin = class WebpackStatsPlugin {
  constructor({ stats: resolvable }) {
    this.apply = (compiler) => {
      compiler.hooks.emit.tap('untool-stats', (compilation) => {
        try {
          const stats = compilation.getStats().toJson();
          const moduleChunkGroupMap = {};
          const chunkGroups = compilation.chunkGroups.reduce(
            (result, { chunks }) => [...result, chunks],
            []
          );
          compilation.chunks.forEach((chunk) => {
            for (const module of chunk.modulesIterable) {
              let currentModule = module;
              if (module.constructor.name === 'ConcatenatedModule') {
                currentModule = module.rootModule;
              }
              moduleChunkGroupMap[currentModule.rawRequest] = chunkGroups.find(
                (group) => group.find(({ id }) => chunk.id === id)
              );
            }
          });
          const moduleFileMap = Object.keys(moduleChunkGroupMap).reduce(
            (result, rawRequest) => ({
              ...result,
              [rawRequest]: (moduleChunkGroupMap[rawRequest] || [])
                .reduce((result, { files }) => [...result, ...files], [])
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
        } catch (error) {
          resolvable.reject(error);
        }
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
