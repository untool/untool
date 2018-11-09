'use strict';

const esc = require('serialize-javascript');

const renderCSS = ({ css }) =>
  css.map((asset) => `<link rel="stylesheet" href="/${asset}" />`).join('');

const renderJS = ({ js }) =>
  js.map((asset) => `<script src="/${asset}"></script>`).join('');

const renderGlobals = (globals = {}) => {
  const entries = Object.entries(globals).map(([k, v]) => `${k}=${esc(v)}`);
  return entries.length ? `<script>var ${entries.join(',')};</script>` : '';
};

module.exports = ({ fragments = {}, assets, mountpoint, markup, globals }) =>
  `<!DOCTYPE html>
<html ${fragments.htmlAttributes || ''}>
  <head>
    ${fragments.headPrefix || ''}
    ${fragments.title || ''}
    ${fragments.base || ''}
    ${fragments.meta || ''}
    ${fragments.link || ''}
    ${renderCSS(assets)}
    ${fragments.style || ''}
    ${fragments.script || ''}
    ${fragments.headSuffix || ''}
  </head>
  <body ${fragments.bodyAttributes || ''}>
    <div id="${mountpoint}">${markup || ''}</div>
    ${fragments.noscript || ''}
    ${renderGlobals(globals)}
    ${renderJS(assets)}
  </body>
</html>`;
