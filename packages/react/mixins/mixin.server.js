'use strict';

const { parse } = require('url');

const { createElement, isValidElement } = require('react');
const { renderToString } = require('react-dom/server');
const { StaticRouter } = require('react-router-dom');
const {
  Helmet: { renderStatic },
} = require('react-helmet');

const isPlainObject = require('is-plain-object');

const {
  override,
  async: { compose, parallel, pipe },
} = require('mixinable');

const {
  Mixin,
  internal: { validate, invariant },
} = require('@untool/core');

const getAssets = require('../lib/assets');
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
      .then((element) => this.fetchData({}, element).then(() => element))
      .then((element) => {
        const reactMarkup = renderToString(element);
        const fragments = Object.entries(renderStatic()).reduce(
          (result, [key, value]) => ({ ...result, [key]: value.toString() }),
          { reactMarkup, headPrefix: '', headSuffix: '' }
        );
        const assets = getAssets(this.stats, this.context.modules);
        const globals = { _env: this.config._env };
        return { fragments, assets, globals };
      })
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
  bootstrap: validate(parallel, ([req, res]) => {
    invariant(
      req && req.app && req.url,
      'bootstrap(): Received invalid HTTP request object'
    );
    invariant(
      res && res.app && res.locals,
      'bootstrap(): Received invalid HTTP response object'
    );
  }),
  enhanceElement: validate(
    compose,
    ([element]) => {
      invariant(
        isValidElement(element),
        'enhanceElement(): Received invalid React element'
      );
    },
    (result) => {
      invariant(
        isValidElement(result),
        'enhanceElement(): Returned invalid React element'
      );
    }
  ),
  fetchData: validate(
    pipe,
    ([data, element]) => {
      invariant(
        isPlainObject(data),
        'fetchData(): Received invalid data object'
      );
      invariant(
        isValidElement(element),
        'fetchData(): Received invalid React element'
      );
    },
    (result) => {
      invariant(
        isPlainObject(result),
        'fetchData(): Returned invalid data object'
      );
    }
  ),
  getTemplateData: validate(
    pipe,
    ([data]) => {
      invariant(
        isPlainObject(data),
        'getTemplateData(): Received invalid data object'
      );
    },
    (result) => {
      invariant(
        isPlainObject(result),
        'getTemplateData(): Returned invalid data object'
      );
    }
  ),
  render: validate(override, ([req, res, next]) => {
    invariant(
      req && req.app && req.url,
      'render(): Received invalid HTTP request object'
    );
    invariant(
      res && res.app && res.locals,
      'render(): Received invalid HTTP response object'
    );
    invariant(
      typeof next === 'function',
      'render(): Received invalid next() function'
    );
  }),
};

module.exports = ReactMixin;
