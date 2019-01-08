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
          return [...result, [module.id, chunks]];
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
  constructor(enhancedPromise) {
    this.apply = (compiler) => {
      compiler.hooks.compilation.tap('StatsPlugin', (compilation) => {
        compilation.hooks.additionalAssets.tap('StatsPlugin', () => {
          if (compilation.compiler.isChild()) {
            return;
          }
          try {
            enhancedPromise.resolve({
              ...compilation.getStats().toJson({ source: false }),
              ...extractFiles(analyzeCompilation(compilation)),
            });
          } catch (error) {
            enhancedPromise.reject(error);
          }
        });
      });
      compiler.hooks.watchRun.tap('StatsPlugin', () => enhancedPromise.reset());
    };
  }
};

exports.StatsFilePlugin = class StatsFilePlugin {
  constructor(enhancedPromise, { statsFile }) {
    this.apply = (compiler) => {
      compiler.hooks.compilation.tap('StatsFilePlugin', (compilation) =>
        compilation.hooks.additionalAssets.tapPromise('StatsFilePlugin', () =>
          enhancedPromise.then(
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
