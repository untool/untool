'use strict';

exports.resolve = function resolve(...args) {
  const basePath = exports.trimTrailingSlash(args.shift());
  const pathSegments = args.map((segment) => exports.trimSlashes(segment));
  return [basePath, ...pathSegments].join('/');
};

exports.resolveFolder = function resolveFolder(...args) {
  return exports.resolve(...args).replace(/^(.*?)\/*$/, '$1/');
};

exports.resolveAbsolute = function resolveAbsolute(...args) {
  return exports.addLeadingSlash(exports.resolve(...args));
};

exports.resolveRelative = function resolveRelative(...args) {
  return exports.trimLeadingSlash(exports.resolve(...args));
};

exports.resolveAbsoluteFolder = function resolveAbsoluteFolder(...args) {
  return exports.addLeadingSlash(exports.resolveFolder(...args));
};

exports.resolveRelativeFolder = function resolveRelativeFolder(...args) {
  return exports.trimLeadingSlash(exports.resolveFolder(...args));
};

exports.addLeadingSlash = function addLeadingSlash(location) {
  return location.replace(/^\/*/, '/');
};

exports.addTrailingSlash = function addTrailingSlash(location) {
  return location.replace(/\/*$/, '/');
};

exports.trimLeadingSlash = function trimLeadingSlash(location) {
  return location.replace(/^\/+/, '');
};

exports.trimTrailingSlash = function trimTrailingSlash(location) {
  return location.replace(/\/+$/, '');
};

exports.trimSlashes = function trimSlashes(location) {
  return exports.trimLeadingSlash(exports.trimTrailingSlash(location));
};
