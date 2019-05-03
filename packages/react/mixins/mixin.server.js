'use strict';

const { parse } = require('url');

const { createElement, isValidElement } = require('react');
const { StaticRouter } = require('react-router-dom');

const isPlainObject = require('is-plain-object');

const {
  override: overrideSync,
  async: { compose, parallel, pipe, override: overrideAsync },
} = require('mixinable');
const { ensureLeadingSlash, trimTrailingSlash } = require('pathifist');

const {
  Mixin,
  internal: { validate, invariant },
} = require('@untool/core');

const getAssets = require('../lib/assets');
const template = require('../lib/template');
const renderToFragments = require('../lib/fragments');

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
      basename: trimTrailingSlash(ensureLeadingSlash(this.config.basePath)),
      context: this.context,
    };
    return createElement(StaticRouter, props, element);
  }
  renderToFragments(element) {
    return renderToFragments(element);
  }
  renderTemplate(fragments, modules, stats) {
    const assets = getAssets(stats, modules);
    const globals = { _env: this.config._env };
    return this.getTemplateData({ fragments, assets, globals }).then(
      (templateData) => template(templateData)
    );
  }
  render(req, res, next) {
    Promise.resolve()
      .then(() => this.bootstrap(req, res))
      .then(() => this.enhanceElement(this.element))
      .then((element) =>
        this.fetchData({}, element).then(() => this.renderToFragments(element))
      )
      .then((fragments) => {
        if (this.context.miss) {
          next();
        } else {
          if (this.context.headers) {
            res.set(this.context.headers);
          }
          if (this.context.url) {
            res.redirect(this.context.status || 301, this.context.url);
          } else {
            res.status(this.context.status || 200);
            return this.renderTemplate(
              fragments,
              this.context.modules,
              this.stats
            ).then((page) => res.send(page));
          }
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
  renderToFragments: validate(
    overrideAsync,
    ([element]) => {
      invariant(
        isValidElement(element),
        'renderToFragments(): Received invalid React element'
      );
    },
    (result) => {
      invariant(
        isPlainObject(result),
        'renderToFragments(): Returned invalid result'
      );
    }
  ),
  renderTemplate: validate(
    overrideAsync,
    ([fragments, modules]) => {
      invariant(
        isPlainObject(fragments),
        'renderTemplate(): Received invalid object'
      );
      invariant(
        Array.isArray(modules),
        'renderTemplate(): Received invalid modules array'
      );
    },
    (result) => {
      invariant(
        typeof result === 'string',
        'renderTemplate(): Returned invalid result'
      );
    }
  ),
  render: validate(overrideSync, ([req, res, next]) => {
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
