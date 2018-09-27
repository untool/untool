'use strict';

const { RawSource } = require('webpack-sources');

const analyzeCompilation = ({ chunks, chunkGroups }) => {
  const entries = chunks.filter(({ entryModule }) => !!entryModule);
  const groups = chunkGroups.reduce(
    (result, { chunks }) => [...result, chunks],
    []
  );
  const moduleGroupMap = chunks.reduce((result, chunk) => {
    if (!entries.includes(chunk)) {
      for (const module of chunk.modulesIterable) {
        const chunkGroup = groups.find((group) => group.includes(chunk));
        if (module.constructor.name === 'ConcatenatedModule') {
          result[module.rootModule.rawRequest] = chunkGroup;
        } else {
          result[module.rawRequest] = chunkGroup;
        }
      }
    }
    return result;
  }, {});
  return { entries, groups, moduleGroupMap };
};

const extractFiles = ({ entries, groups, moduleGroupMap }) => {
  const getFiles = (chunks) => {
    return chunks.reduce((result, { files }) => [...result, ...files], []);
  };
  return {
    entryFiles: getFiles(entries),
    vendorFiles: getFiles(
      groups
        .find((group) => group.find((chunk) => entries.includes(chunk)))
        .filter((chunk) => !entries.includes(chunk))
    ),
    moduleFileMap: Object.entries(moduleGroupMap).reduce(
      (result, [module, group]) => ({ ...result, [module]: getFiles(group) }),
      {}
    ),
  };
};

exports.StatsPlugin = class StatsPlugin {
  constructor({ stats: resolvable }) {
    this.apply = (compiler) => {
      compiler.hooks.compilation.tap('StatsPlugin', (compilation) => {
        compilation.hooks.additionalAssets.tap('StatsPlugin', () => {
          try {
            resolvable.resolve({
              ...compilation.getStats().toJson(),
              ...extractFiles(analyzeCompilation(compilation)),
            });
          } catch (error) {
            resolvable.reject(error);
          }
        });
      });
      compiler.hooks.watchRun.tap('StatsPlugin', () => resolvable.reset());
    };
  }
};

exports.StatsFilePlugin = class StatsFilePlugin {
  constructor({ stats: resolvable, config: { statsFile } }) {
    this.apply = (compiler) => {
      compiler.hooks.compilation.tap('StatsFilePlugin', (compilation) =>
        compilation.hooks.additionalAssets.tapPromise('StatsFilePlugin', () =>
          resolvable.then(
            (stats) =>
              (compilation.assets[statsFile] = new RawSource(
                JSON.stringify(stats)
              ))
          )
        )
      );
    };
  }
};
