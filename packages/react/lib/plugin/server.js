import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { Helmet } from 'react-helmet';

import { Plugin } from '@untool/core';
import { async } from 'mixinable';

import template from '../template';

export default class ReactPlugin extends Plugin {
  static definition = {
    bootstrap: async.parallel,
    enhanceElement: async.compose,
    fetchData: async.pipe,
  };
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
