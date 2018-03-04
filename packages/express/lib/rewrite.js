import { resolveAbsoluteFolder, stripTrailingSlash } from './uri';

export default (options, config) => {
  const basePath = resolveAbsoluteFolder(config.basePath);
  const assetPath = resolveAbsoluteFolder(config.assetPath);

  const locations = config.locations
    .map(location => resolveAbsoluteFolder(basePath, location))
    .sort((locationA, locationB) => locationB.length - locationA.length);

  const isAsset = url =>
    (assetPath !== basePath && url.startsWith(assetPath)) ||
    /\.[a-z0-9]+$/i.test(url);

  const match = url => location =>
    new RegExp(`^${stripTrailingSlash(location)}(?:(?:/|\\?).*)?$`).test(url);

  return (req, res, next) => {
    if (options.static && options.rewrite) {
      if (!res.locals.noRewrite && !isAsset(req.url)) {
        const destination = locations.find(match(req.url));
        if (destination) {
          req.url = req.originalUrl = destination;
        }
      }
    }
    next();
  };
};
