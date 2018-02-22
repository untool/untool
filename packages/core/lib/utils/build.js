import webpack from 'webpack';
import rimraf from 'rimraf';
import index from 'directory-index';

import { resolveAbsolute, resolveRelative } from './url';

import createStaticRenderer from '../services/static';

export function clean(...directories) {
  return Promise.all(
    directories.map(
      directory =>
        new Promise((resolve, reject) =>
          rimraf(directory, error => (error ? reject(error) : resolve()))
        )
    )
  );
}

export function build(options) {
  return Promise.resolve().then(() => {
    const { webpackBrowserConfig, webpackNodeConfig } = options;
    const webpackConfig = options.static
      ? webpackBrowserConfig
      : [webpackBrowserConfig, webpackNodeConfig];
    return new Promise((resolve, reject) =>
      webpack(webpackConfig).run(
        (error, stats) => (error ? reject(error) : resolve(stats))
      )
    );
  });
}

export function render(options) {
  return Promise.resolve().then(() => {
    const { basePath, locations, webpackNodeConfig } = options;
    const render = createStaticRenderer(webpackNodeConfig);
    return Promise.all(
      locations
        .map(location => resolveAbsolute(basePath, location))
        .map(location => render(location))
    ).then(responses =>
      responses.reduce(
        (result, response, i) => ({
          ...result,
          [resolveRelative(basePath, index(locations[i]))]: response,
        }),
        {}
      )
    );
  });
}
