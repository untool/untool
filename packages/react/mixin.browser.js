'use strict';

/* eslint-env browser */

import { createElement } from 'react';
import { unmountComponentAtNode, hydrate, render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { async } from 'mixinable';

import { Mixin } from '@untool/core';

const { compose, parallel, pipe } = async;

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
    const attribute = `data-${name}`;
    const mountpoint = document.querySelector(`#${name}`);
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
};

export default ReactMixin;
