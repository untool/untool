const { createElement } = require('react');
const { renderToString } = require('react-dom/server');
const { StaticRouter } = require('react-router');
const { Helmet } = require('react-helmet');

const { override, async: { compose, parallel, pipe } } = require('mixinable');

const { Mixin } = require('@untool/core');

const template = require('./lib/template');

class ReactPlugin extends Mixin {
  constructor(core, config, element, options) {
    super(core, config);
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
  fetchData(data) {
    return {
      ...data,
      mountpoint: this.config.namespace,
      assetsByType: this.assetsByType,
      globals: [],
    };
  }
  render(req, res, next) {
    Promise.resolve()
      .then(() => this.core.bootstrap(req, res))
      .then(() => this.core.enhanceElement(this.element))
      .then(element =>
        this.core.fetchData({}, element).then(data => ({ element, data }))
      )
      .then(result => {
        const { element, data } = result;
        const document = this.renderToString(element, data);
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
      })
      .catch(next);
  }
  renderToString(element, data) {
    return template({
      ...data,
      markup: renderToString(element),
      helmet: Helmet.renderStatic(),
    });
  }
}

ReactPlugin.strategies = {
  render: override,
  bootstrap: parallel,
  enhanceElement: compose,
  fetchData: pipe,
};

module.exports = ReactPlugin;
