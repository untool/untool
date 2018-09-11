'use strict';

const { extname } = require('path');

const { RawSource } = require('webpack-sources');

exports.StatsPlugin = class WebpackStatsPlugin {
  constructor({ stats: resolvable, config: { name: entry } }) {
    this.apply = (compiler) => {
      compiler.hooks.emit.tap('untool-stats', (compilation) => {
        const stats = compilation.getStats().toJson();
        const entryAssetsByType = Object.entries(stats.assetsByChunkName)
          .filter(([name]) => new RegExp(`^(vendors~)?${entry}$`).test(name))
          .sort(([name]) => (name.startsWith('vendors~') ? 0 : 1))
          .map(([, assets]) => (Array.isArray(assets) ? assets : [assets]))
          .reduce(
            (result, assets) =>
              assets.reduce((result, asset) => {
                const extension = extname(asset).substring(1);
                if (result[extension] && !asset.endsWith('.hot-update.js')) {
                  result[extension].push(asset);
                }
                return result;
              }, result),
            { css: [], js: [] }
          );
        resolvable.resolve({ ...stats, entryAssetsByType });
      });
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
