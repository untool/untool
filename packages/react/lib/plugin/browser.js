/* eslint-env browser */
import { createElement } from 'react';
import { unmountComponentAtNode, hydrate, render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { Plugin } from '@untool/core';
import { async } from 'mixinable';

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
      basename: config.basePath,
      ...(options && options.router),
    };
  }
  enhanceElement(element) {
    return createElement(BrowserRouter, this.routerOptions, element);
  }
  render() {
    var mountpoint = document.querySelector(`#${this.config.namespace}`);
    var attribute = `data-${this.config.namespace}`;
    var isMounted = mountpoint.hasAttribute(attribute);
    if (isMounted) {
      unmountComponentAtNode(mountpoint);
    } else {
      mountpoint.setAttribute(attribute, '');
    }
    Promise.resolve()
      .then(() => this.core.bootstrap())
      .then(() => this.core.enhanceElement(this.element))
      .then(element => this.core.fetchData(null, element).then(() => element))
      .then(element => (isMounted ? render : hydrate)(element, mountpoint));
  }
}
