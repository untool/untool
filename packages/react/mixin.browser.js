/* eslint-env browser */
const { createElement } = require('react');
const { unmountComponentAtNode, hydrate, render } = require('react-dom');
const { BrowserRouter } = require('react-router-dom');

const { override, async: { compose, parallel, pipe } } = require('mixinable');

const { Mixin } = require('@untool/core');

class ReactMixin extends Mixin {
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

ReactMixin.strategies = {
  render: override,
  bootstrap: parallel,
  enhanceElement: compose,
  fetchData: pipe,
};

module.exports = ReactMixin;
