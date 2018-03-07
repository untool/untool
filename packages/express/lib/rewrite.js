const minimatch = require('minimatch');

const { resolveAbsoluteFolder, stripTrailingSlash } = require('./uri');

module.exports = (options, config) => {
  const basePath = resolveAbsoluteFolder(config.basePath);
  const assetPath = resolveAbsoluteFolder(config.assetPath);

  const locations = config.locations
    .map(location => resolveAbsoluteFolder(basePath, location))
    .sort((locA, locB) => locB.split('/').length - locA.split('/').length);

  const isAsset = url =>
    (assetPath !== basePath && url.startsWith(assetPath)) ||
    /\.[a-z0-9]+$/i.test(url);

  return (req, res, next) => {
    if (options.static && options.rewrite) {
      if (!res.locals.noRewrite && !isAsset(req.url)) {
        const destination = locations.find(location =>
          minimatch(req.url, stripTrailingSlash(location), {
            nobrace: true,
            nocomment: true,
            noext: true,
            nonegate: true,
          })
        );
        if (destination) {
          req.url = req.originalUrl = destination;
        }
      }
    }
    next();
  };
};
