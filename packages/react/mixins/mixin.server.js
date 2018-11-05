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
    const { basePath: basename } = config;
    const modules = (this.modules = []);
    const context = (this.context = { modules });
    this.options = { ...(options && options.router), basename, context };
  }
  bootstrap(req, res) {
    const { pathname, search } = parse(req.url);
    this.options.location = { pathname, search };
    this.stats = res.locals.stats;
  }
  enhanceElement(element) {
    return createElement(StaticRouter, this.options, element);
  }
  render(req, res, next) {
    Promise.resolve()
      .then(() => this.bootstrap(req, res))
      .then(() => this.enhanceElement(this.element))
      .then((element) =>
        this.fetchData({}, element).then((data) =>
          render(element, data, this.config, this.modules, this.stats)
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
