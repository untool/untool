'use strict';

const { extname } = require('path');

const { renderToString } = require('react-dom/server');
const { Helmet } = require('react-helmet');

function determineAssets(modules, stats) {
  const { entryFiles, vendorFiles, moduleFileMap } = stats;
  const moduleFiles = modules.reduce(
    (result, module) => [...result, ...moduleFileMap[module]],
    []
  );
  return [
    ...vendorFiles.sort((a, b) => b.localeCompare(a)),
    ...moduleFiles.sort((a, b) => b.localeCompare(a)),
    ...entryFiles.sort((a, b) => b.localeCompare(a)),
  ]
    .filter(
      (asset, index, self) =>
        self.indexOf(asset) === index &&
        /\.(css|js)$/.test(asset) &&
        !/\.hot-update\./.test(asset)
    )
    .reduce(
      (result, asset) => {
        const extension = extname(asset).substring(1);
        result[extension].push(asset);
        return result;
      },
      { css: [], js: [] }
    );
}

module.exports = function render(element, fetchedData, config, modules, stats) {
  const markup = renderToString(element);
  const helmet = Helmet.renderStatic();
  const fragments = Object.entries(helmet).reduce(
    (result, [key, value]) => ({ ...result, [key]: value.toString() }),
    { headPrefix: '', headSuffix: '' }
  );
  const assets = determineAssets(modules, stats);
  const { name: mountpoint, _env } = config;
  const globals = { _env };
  return { fetchedData, markup, fragments, assets, mountpoint, globals };
};
