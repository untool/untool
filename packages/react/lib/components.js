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

exports.Import = ({ module, load, weakId }) => {
  class ImportPlaceholder extends Component {
    constructor(placeholderProps) {
      super(placeholderProps);
      const { load, ...props } = placeholderProps;
      load().then(({ default: Component }) =>
        this.setState({ Component, props })
      );
      this.state = { Component: () => null };
    }
    render() {
      const { Component, props } = this.state;
      return createElement(Component, props);
    }
  }
  return withRouter(function ImportManager(managerProps) {
    const { staticContext, placeholder, ...props } = managerProps;
    if (staticContext) {
      staticContext.modules.push(module);
    }
    if (staticContext || __webpack_modules__[weakId]) {
      const Component = __webpack_require__(weakId).default;
      return createElement(Component, props);
    } else {
      const Placeholder = placeholder || ImportPlaceholder;
      return createElement(Placeholder, { ...props, load });
    }
  });
};
