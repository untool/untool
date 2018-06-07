const esc = require('serialize-javascript');

const variable = ({ name, value }) => `<script>${name}=${esc(value)}</script>`;
const cssLink = (css) => `<link rel="stylesheet" href="/${css}" />`;
const jsLink = (js) => `<script src="/${js}"></script>`;

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
    ${data.globals.map(variable).join('')}
    ${data.assetsByType.js.map(jsLink).join('')}
  </body>
</html>`.replace(/(^\s*[\r\n]| (?=>))/gm, '');
