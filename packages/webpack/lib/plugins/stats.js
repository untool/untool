'use strict';

const { RawSource } = require('webpack-sources');

const analyzeCompilation = ({ chunks, chunkGroups }) => {
  const entryChunks = chunks.filter(({ entryModule }) => !!entryModule);
  const vendorChunks = chunkGroups.reduce(
    (result, { chunks }) => [
      ...result,
      ...(chunks.find((chunk) => entryChunks.includes(chunk))
        ? chunks.filter((chunk) => !entryChunks.includes(chunk))
        : []),
    ],
    []
  );
  const chunksByModule = chunks
    .filter(
      (chunk) => !entryChunks.includes(chunk) && !vendorChunks.includes(chunk)
    )
    .reduce(
      (result, chunk) =>
        Array.from(chunk.modulesIterable).reduce((result, module) => {
          const { chunks } = chunkGroups.find(({ chunks }) =>
            chunks.includes(chunk)
          );
          if (module.constructor.name === 'ConcatenatedModule') {
            result.push([module.rootModule.id, chunks]);
          } else {
            result.push([module.id, chunks]);
          }
          return result;
        }, result),
      []
    );
  return { entryChunks, vendorChunks, chunksByModule };
};

const extractFiles = ({ entryChunks, vendorChunks, chunksByModule }) => {
  const gatherFiles = (result, { files }) => [...result, ...files];
  return {
    entryFiles: entryChunks.reduce(gatherFiles, []),
    vendorFiles: vendorChunks.reduce(gatherFiles, []),
    moduleFileMap: chunksByModule.reduce((result, [module, chunks]) => {
      result[module] = chunks.reduce(gatherFiles, []);
      return result;
    }, {}),
  };
};

exports.StatsPlugin = class StatsPlugin {
  constructor({ stats: resolvable }) {
    this.apply = (compiler) => {
      compiler.hooks.compilation.tap('StatsPlugin', (compilation) => {
        compilation.hooks.additionalAssets.tap('StatsPlugin', () => {
          if (compilation.compiler !== compiler) {
            return;
          }
          try {
            resolvable.resolve({
              ...compilation.getStats().toJson({ source: false }),
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
