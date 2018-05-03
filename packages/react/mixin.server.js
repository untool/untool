const { createElement } = require('react');
const { renderToString } = require('react-dom/server');
const { StaticRouter } = require('react-router');
const { Helmet } = require('react-helmet');

const { override, async: { compose, parallel, pipe } } = require('mixinable');

const { Mixin } = require('@untool/core');

const template = require('./lib/template');

class ReactPlugin extends Mixin {
  constructor(config, element, options) {
    super(config);
    this.element = element;
    this.routerOptions = {
      context: {},
      basename: config.basePath,
      ...(options && options.router),
    };
    this.routerContext = this.routerOptions.context;
  }
  bootstrap(req, res) {
    this.location = req.path;
    this.assetsByType = res.locals.assetsByType;
  }
  enhanceElement(element) {
    const routerOptions = {
      ...this.routerOptions,
      location: this.location,
    };
    return createElement(StaticRouter, routerOptions, element);
  }
  enhanceData(data) {
    return {
      ...data,
      mountpoint: this.config.namespace,
      assetsByType: this.assetsByType,
      globals: [],
      fragments: Object.keys(data.helmet).reduce(
        (result, key) => ({
          ...result,
          [key]: data.helmet[key].toString(),
        }),
        { headPrefix: '', headSuffix: '' }
      ),
    };
  }
  render(req, res, next) {
    Promise.resolve()
      .then(() => this.bootstrap(req, res))
      .then(() => this.enhanceElement(this.element))
      .then(element =>
        this.fetchData({}, element).then(data => ({ element, data }))
      )
      .then(result => {
        const { element, data } = result;
        const markup = renderToString(element);
        const helmet = Helmet.renderStatic();
        this.enhanceData({ ...data, markup, helmet })
          .then(template)
          .then(document => {
            const routerContext = this.routerContext;
            if (routerContext.miss) {
              next();
            } else if (routerContext.url) {
              res.status(routerContext.status || 301);
              res.set('Location', routerContext.url);
              routerContext.headers && res.set(routerContext.headers);
              res.end();
            } else {
              res.status(routerContext.status || 200);
              routerContext.headers && res.set(routerContext.headers);
              res.type('html');
              res.send(document);
            }
          });
      })
      .catch(next);
  }
}

ReactPlugin.strategies = {
  render: override,
  bootstrap: parallel,
  enhanceElement: compose,
  fetchData: pipe,
  enhanceData: pipe,
};

module.exports = ReactPlugin;
