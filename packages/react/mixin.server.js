const { createElement } = require('react');
const { renderToString } = require('react-dom/server');
const { StaticRouter } = require('react-router');
const { Helmet } = require('react-helmet');

const {
  override,
  async: { compose, parallel, pipe },
} = require('mixinable');

const { Mixin } = require('@untool/core');

const template = require('./lib/template');

class ReactPlugin extends Mixin {
  constructor(config, element, options) {
    super(config);
    this.element = element;
    this.options = Object.assign(
      {
        context: {},
        basename: config.basePath,
      },
      options && options.router
    );
  }
  bootstrap(req, res) {
    this.options.location = req.path;
    this.assetsByType = res.locals.assetsByType;
  }
  enhanceElement(element) {
    return createElement(StaticRouter, this.options, element);
  }
  enhanceData(data) {
    return Object.assign(data, {
      mountpoint: this.config.name,
      assetsByType: this.assetsByType,
      globals: data.globals || [],
      fragments: Object.keys(data.helmet).reduce(
        (result, key) =>
          Object.assign(result, {
            [key]: data.helmet[key].toString(),
          }),
        { headPrefix: '', headSuffix: '' }
      ),
    });
  }
  render(req, res, next) {
    Promise.resolve()
      .then(() => this.bootstrap(req, res))
      .then(() => this.enhanceElement(this.element))
      .then((element) =>
        this.fetchData({}, element).then((data) => ({ element, data }))
      )
      .then(({ element, data }) => {
        const markup = renderToString(element);
        const helmet = Helmet.renderStatic();
        const { context = {} } = this.options;
        if (context.miss) {
          next();
        } else if (context.url) {
          res.status(context.status || 301);
          res.set('Location', context.url);
          context.headers && res.set(context.headers);
          res.end();
        } else {
          res.status(context.status || 200);
          context.headers && res.set(context.headers);
          res.type('html');
          return this.enhanceData(Object.assign(data, { markup, helmet })).then(
            (data) => res.send(template(data))
          );
        }
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
