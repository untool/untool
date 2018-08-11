'use strict';

exports.resolve = function resolve(...args) {
  const basePath = exports.stripTrailingSlash(args.shift());
  const pathSegments = args.map((segment) =>
    segment.replace(/(?:^\/+|\/+$)/g, '')
  );
  return [basePath].concat(pathSegments).join('/');
};

exports.resolveFolder = function resolveFolder(...args) {
  return exports.resolve(...args).replace(/^(.*?)\/*$/, '$1/');
};

exports.resolveAbsolute = function resolveAbsolute(...args) {
  return exports.addLeadingSlash(exports.resolve(...args));
};

exports.resolveRelative = function resolveRelative(...args) {
  return exports.stripLeadingSlash(exports.resolve(...args));
};

exports.resolveAbsoluteFolder = function resolveAbsoluteFolder(...args) {
  return exports.addLeadingSlash(exports.resolveFolder(...args));
};

exports.resolveRelativeFolder = function resolveRelativeFolder(...args) {
  return exports.stripLeadingSlash(exports.resolveFolder(...args));
};

exports.addLeadingSlash = function addLeadingSlash(location) {
  return location.replace(/^\/*/, '/');
};

exports.addTrailingSlash = function addTrailingSlash(location) {
  return location.replace(/\/*$/, '/');
};

exports.stripLeadingSlash = function stripLeadingSlash(location) {
  return location.replace(/^\/+/, '');
};

exports.stripTrailingSlash = function stripTrailingSlash(location) {
  return location.replace(/\/+$/, '');
};
