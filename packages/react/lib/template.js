var esc = require('serialize-javascript');

export default data =>
  `<!DOCTYPE html>
<html ${data.helmet.htmlAttributes.toString()}>
  <head>
    ${data.helmet.title.toString()}
    ${data.helmet.base.toString()}
    ${data.helmet.meta.toString()}
    ${data.helmet.link.toString()}
    ${data.assetsByType.css
      .map(css => `<link rel="stylesheet" href="/${css}" />`)
      .join('')}
    ${data.helmet.style.toString()}
    ${data.helmet.script.toString()}
  </head>
  <body ${data.helmet.bodyAttributes.toString()}>
    <div id="${data.mountpoint}">${data.markup}</div>
    ${data.helmet.noscript.toString()}
    ${data.globals
      .map(global => `<script>${global.name}=${esc(global.value)}</script>`)
      .join('')}
    ${data.assetsByType.js.map(js => `<script src="/${js}"></script>`).join('')}
  </body>
</html>`;
