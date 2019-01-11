'use strict';

const { parse } = require('url');

const { createElement } = require('react');
const { default: StaticRouter } = require('react-router-dom/es/StaticRouter');

const {
  override,
  async: { compose, parallel, pipe },
} = require('mixinable');

const { Mixin } = require('@untool/core');

const render = require('../lib/render');
const template = require('../lib/template');

class ReactMixin extends Mixin {
  constructor(config, element, options) {
    super(config, options);
    this.element = element;
    this.context = { modules: [] };
  }
  bootstrap(req, res) {
    this.url = parse(req.url);
    this.stats = res.locals.stats;
  }
  enhanceElement(element) {
    const { pathname, search } = this.url;
    const props = {
      ...this.options.router,
      location: { pathname, search },
      basename: this.config.basePath,
      context: this.context,
    };
    return createElement(StaticRouter, props, element);
  }
  render(req, res, next) {
    Promise.resolve()
      .then(() => this.bootstrap(req, res))
      .then(() => this.enhanceElement(this.element))
      .then((element) =>
        this.fetchData({}, element).then((data) =>
          render(element, data, this.config, this.stats, this.context.modules)
        )
      )
      .then((initialData) => {
        if (this.context.miss) {
          next();
        } else if (this.context.url) {
          this.context.headers && res.set(this.context.headers);
          res.redirect(this.context.status || 301, this.context.url);
        } else {
          this.context.headers && res.set(this.context.headers);
          res.status(this.context.status || 200);
          return this.getTemplateData(initialData).then((templateData) =>
            res.send(template(templateData))
          );
        }
      })
      .catch(next);
  }
}

ReactMixin.strategies = {
  bootstrap: parallel,
  enhanceElement: compose,
  fetchData: pipe,
  getTemplateData: pipe,
  render: override,
};

module.exports = ReactMixin;
