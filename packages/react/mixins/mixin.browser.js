'use strict';

/* eslint-env browser */

const { createElement } = require('react');
const { unmountComponentAtNode, hydrate, render } = require('react-dom');
const { default: BrowserRouter } = require('react-router-dom/es/BrowserRouter');

const {
  override,
  async: { compose, parallel, pipe },
} = require('mixinable');

const { Mixin } = require('@untool/core');

class ReactMixin extends Mixin {
  constructor(config, element, options) {
    super(config, options);
    this.element = element;
  }
  enhanceElement(element) {
    const props = {
      ...this.options.router,
      basename: this.config.basePath,
    };
    return createElement(BrowserRouter, props, element);
  }
  render() {
    const mountpoint = document.querySelector('[data-mountpoint]');
    const isMounted = mountpoint.hasAttribute('data-mounted');
    if (isMounted) {
      unmountComponentAtNode(mountpoint);
    } else {
      mountpoint.setAttribute('data-mounted', '');
    }
    Promise.resolve()
      .then(() => this.bootstrap())
      .then(() => this.enhanceElement(this.element))
      .then((element) =>
        this.fetchData({}, element).then(() =>
          (isMounted ? render : hydrate)(element, mountpoint)
        )
      );
  }
}

ReactMixin.strategies = {
  bootstrap: parallel,
  enhanceElement: compose,
  fetchData: pipe,
  render: override,
};

module.exports = ReactMixin;
