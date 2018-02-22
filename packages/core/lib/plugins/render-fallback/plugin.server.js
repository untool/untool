import { join } from 'path';
import { readFileSync } from 'fs';

import marked from 'marked';

import Plugin from '../runtime';

const template = (title, content, css, js) => `
<!doctype html>
<html>
  <head>
    <title>${title}</title>
    ${css.map(css => `<link rel="stylesheet" href="/${css}" />`).join('')}
    <style>
      body {
        font-family: sans-serif
      }
      article {
        box-sizing: border-box;
        min-width: 200px;
        max-width: 960px;
        margin: 0 auto;
        padding: 45px;
      }
      @media (max-width: 767px) {
        article {
          padding: 15px;
        }
      }
  </style>
  </head>
  <body>
    <article>${content}</article>
    ${js.map(js => `<script src="/${js}"></script>`).join('')}
  </body>
</html>
`;

export default class RenderFallbackPlugin extends Plugin {
  render(req, res) {
    res.send(
      template(
        this.config.namespace,
        marked(readFileSync(join(this.config.rootDir, 'README.md'), 'utf8')),
        res.locals.assetsByType.css,
        res.locals.assetsByType.js
      )
    );
  }
}
