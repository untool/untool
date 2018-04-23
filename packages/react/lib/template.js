const esc = require('serialize-javascript');

const variable = ({ name, value }) => `<script>${name}=${esc(value)}</script>`;
const cssLink = css => `<link rel="stylesheet" href="/${css}" />`;
const jsLink = js => `<script src="/${js}"></script>`;

module.exports = data =>
  `<!DOCTYPE html>
<html ${data.helmet.htmlAttributes.toString()}>
  <head>
    ${data.helmet.title.toString()}
    ${data.helmet.base.toString()}
    ${data.helmet.meta.toString()}
    ${data.helmet.link.toString()}
    ${data.assetsByType.css.map(cssLink).join('')}
    ${data.helmet.style.toString()}
    ${data.helmet.script.toString()}
  </head>
  <body ${data.helmet.bodyAttributes.toString()}>
    <div id="${data.mountpoint}">${data.markup}</div>
    ${data.helmet.noscript.toString()}
    ${data.globals.map(variable).join('')}
    ${data.assetsByType.js.map(jsLink).join('')}
  </body>
</html>`.replace(/(^\s*[\r\n]| (?=>))/gm, '');
