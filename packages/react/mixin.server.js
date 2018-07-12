const { createElement } = require('react');
const { renderToString } = require('react-dom/server');
const { StaticRouter } = require('react-router-dom');
const { Helmet } = require('react-helmet');

const {
  override,
  async: { compose, parallel, pipe },
} = require('mixinable');

const { Mixin } = require('@untool/core');

const template = require('./lib/template');

class ReactMixin extends Mixin {
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
  getTemplateData(data) {
    return Object.assign(data, {
      mountpoint: this.config.name,
      assetsByType: this.assetsByType,
      globals: Object.assign({ _env: this.config._env }, data.globals),
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
      .then(({ element, data: fetchedData }) => {
        const markup = renderToString(element);
        const helmet = Helmet.renderStatic();
        const { context } = this.options;
        if (context.miss) {
          next();
        } else if (context.url) {
          context.headers && res.set(context.headers);
          res.redirect(context.status || 301, context.url);
        } else {
          context.headers && res.set(context.headers);
          res.status(context.status || 200);
          return this.getTemplateData({ fetchedData, markup, helmet }).then(
            (templateData) => res.send(template(templateData))
          );
        }
      })
      .catch(next);
  }
}

ReactMixin.strategies = {
  render: override,
  bootstrap: parallel,
  enhanceElement: compose,
  fetchData: pipe,
  getTemplateData: pipe,
};

module.exports = ReactMixin;
