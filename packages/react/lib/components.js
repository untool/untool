'use strict';
/* global __webpack_modules__, __webpack_require__ */

const { createElement, Component } = require('react');
const { default: withRouter } = require('react-router-dom/es/withRouter');

exports.Miss = withRouter(({ staticContext }) => {
  if (staticContext) {
    staticContext.miss = true;
  }
  return null;
});

exports.Status = withRouter(({ staticContext, code }) => {
  if (staticContext) {
    staticContext.status = code;
  }
  return null;
});

exports.Header = withRouter(({ staticContext, name, value }) => {
  if (staticContext) {
    staticContext.headers = { ...staticContext.headers, [name]: value };
  }
  return null;
});

exports.Import = (options) => {
  const { module, load, weakId } = options;
  class ImportComponent extends Component {
    constructor(props) {
      super(props);
      const { componentOrPromise } = props;
      const getComponent = (value) => value.default || value;
      if (componentOrPromise instanceof Promise) {
        this.state = { Component: () => null };
        componentOrPromise.then((value) =>
          this.setState({ Component: getComponent(value) })
        );
      } else {
        this.state = { Component: getComponent(componentOrPromise) };
      }
    }
    render() {
      const { Component } = this.state;
      return createElement(Component);
    }
  }
  return withRouter((props) => {
    const { staticContext, component } = props;
    if (staticContext) {
      staticContext.modules.push(module);
    }
    return createElement(component || ImportComponent, {
      ...props,
      componentOrPromise:
        staticContext || __webpack_modules__[weakId]
          ? __webpack_require__(weakId)
          : load(),
      options,
    });
  });
};
