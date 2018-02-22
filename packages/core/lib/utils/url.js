export function resolve(...args) {
  const basePath = stripTrailingSlash(args.shift());
  const pathSegments = args.map(segment =>
    segment.replace(/(?:^\/+|\/+$)/g, '')
  );
  return [basePath].concat(pathSegments).join('/');
}

export function resolveFolder(...args) {
  return resolve(...args).replace(/^(.*?)\/*$/, '$1/');
}

export function resolveAbsolute(...args) {
  return addLeadingSlash(resolve(...args));
}

export function resolveRelative(...args) {
  return stripLeadingSlash(resolve(...args));
}

export function resolveAbsoluteFolder(...args) {
  return addLeadingSlash(resolveFolder(...args));
}

export function resolveRelativeFolder(...args) {
  return stripLeadingSlash(resolveFolder(...args));
}

export function addLeadingSlash(location) {
  return location.replace(/^\/+/, '/');
}

export function addTrailingSlash(location) {
  return location.replace(/\/+$/, '/');
}

export function stripLeadingSlash(location) {
  return location.replace(/^\/+/, '');
}

export function stripTrailingSlash(location) {
  return location.replace(/\/+$/, '');
}
