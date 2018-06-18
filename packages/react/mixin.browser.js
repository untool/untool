/* eslint-env browser */
const { createElement } = require('react');
const { unmountComponentAtNode, hydrate, render } = require('react-dom');
const { BrowserRouter } = require('react-router-dom');

const {
  override,
  async: { compose, parallel, pipe },
} = require('mixinable');

const { Mixin } = require('@untool/core');

class ReactMixin extends Mixin {
  constructor(config, element, options) {
    super(config);
    this.element = element;
    this.options = Object.assign(
      {
        basename: config.basePath,
      },
      options && options.router
    );
  }
  enhanceElement(element) {
    return createElement(BrowserRouter, this.options, element);
  }
  render() {
    const { name } = this.config;
    const mountpoint = document.querySelector(`#${name}`);
    const attribute = `data-${name}`;
    const isMounted = mountpoint.hasAttribute(attribute);
    if (isMounted) {
      unmountComponentAtNode(mountpoint);
    } else {
      mountpoint.setAttribute(attribute, '');
    }
    Promise.resolve()
      .then(() => this.bootstrap())
      .then(() => this.enhanceElement(this.element))
      .then((element) =>
        this.fetchData({}, element)
          .then((data) => this.enhanceData(data))
          .then(() => element)
      )
      .then((element) => (isMounted ? render : hydrate)(element, mountpoint));
  }
}

ReactMixin.strategies = {
  render: override,
  bootstrap: parallel,
  enhanceElement: compose,
  fetchData: pipe,
  enhanceData: pipe,
};

module.exports = ReactMixin;
