'use strict';

const {
  uri: { addLeadingSlash },
} = require('@untool/express');

module.exports = ({ serverFile, assetFile }) => ({ url }, res, next) =>
  [serverFile, assetFile]
    .map(addLeadingSlash)
    .includes(url.replace(/\?.*?$/, ''))
    ? next('router')
    : next();
