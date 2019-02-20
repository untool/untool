'use strict';

/* eslint-env browser */

const { createElement, isValidElement } = require('react');
const { unmountComponentAtNode, hydrate, render } = require('react-dom');
const { default: BrowserRouter } = require('react-router-dom/es/BrowserRouter');

const isPlainObject = require('is-plain-object');

const {
  override,
  async: { compose, parallel, pipe },
} = require('mixinable');

const {
  Mixin,
  internal: { validate, invariant },
} = require('@untool/core');

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
  bootstrap: validate(parallel, ({ length }) => {
    invariant(length === 0, 'bootstrap(): Received obsolete argument(s)');
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
  render: validate(override, ({ length }) => {
    invariant(length === 0, 'render(): Received obsolete argument(s)');
  }),
};

module.exports = ReactMixin;
