'use strict';

const { RawSource } = require('webpack-sources');

const { trimTrailingSlash } = require('pathifist');

const analyzeCompilation = (compilation) => {
  const chunks = Array.from(compilation.chunks);
  const chunkGroups = Array.from(compilation.chunkGroups);
  const entryChunks = chunks.filter((chunk) =>
    compilation.chunkGraph.hasChunkEntryDependentChunks(chunk)
  );
  const vendorChunks = chunkGroups.reduce(
    (result, { chunks }) => [
      ...result,
      ...(chunks.find((chunk) => entryChunks.includes(chunk))
        ? chunks.filter((chunk) => !entryChunks.includes(chunk))
        : []),
    ],
    []
  );
  const chunksByModule = chunks.reduce((result, chunk) => {
    return Array.from(
      compilation.chunkGraph.getChunkModulesIterable(chunk)
    ).reduce((result, module) => {
      const { chunks } = chunkGroups.find(({ chunks }) => {
        return chunks.includes(chunk);
      });
      return [...result, [compilation.chunkGraph.getModuleId(module), chunks]];
    }, result);
  }, []);
  return { entryChunks, vendorChunks, chunksByModule };
};

const extractFiles = (chunkData, rawPublicPath) => {
  const publicPath = trimTrailingSlash(rawPublicPath);
  const { entryChunks, vendorChunks, chunksByModule } = chunkData;
  const gatherFiles = (result, { files }) => [
    ...result,
    ...files.map((file) => `${publicPath}/${file}`),
  ];
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
          const { publicPath } = compilation.outputOptions;
          if (compilation.compiler.isChild()) {
            return;
          }
          try {
            enhancedPromise.resolve({
              ...compilation.getStats().toJson({ source: false }),
              ...extractFiles(analyzeCompilation(compilation), publicPath),
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
