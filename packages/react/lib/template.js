const esc = require('serialize-javascript');

const cssLink = (css) => `<link rel="stylesheet" href="/${css}" />`;
const jsLink = (js) => `<script src="/${js}"></script>`;

const serializeGlobals = (globals) => {
  const entries = Object.entries(globals);
  if (!entries.length) {
    return '';
  }

  var escaped = entries.map(([k, v]) => `${k}=${esc(v)}`);

  return `<script>var ${escaped.join(',')};</script>`;
};

module.exports = (data) =>
  `<!DOCTYPE html>
<html ${data.fragments.htmlAttributes}>
  <head>
    ${data.fragments.headPrefix}
    ${data.fragments.title}
    ${data.fragments.meta}
    ${data.fragments.link}
    ${data.assetsByType.css.map(cssLink).join('')}
    ${data.fragments.style}
    ${data.fragments.script}
    ${data.fragments.headSuffix}
  </head>
  <body ${data.fragments.bodyAttributes}>
    <div id="${data.mountpoint}">${data.markup}</div>
    ${data.fragments.noscript}
    ${serializeGlobals(data.globals)}
    ${data.assetsByType.js.map(jsLink).join('')}
  </body>
</html>`.replace(/(^\s*[\r\n]| (?=>))/gm, '');
