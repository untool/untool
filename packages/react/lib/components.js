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

exports.Import = ({ module, load, weakId }, name = 'default') => {
  return withRouter(function ImportManager(managerProps) {
    const { staticContext, placeholder, ...props } = managerProps;
    if (staticContext) {
      staticContext.modules.push(module);
    }
    if (staticContext || __webpack_modules__[weakId]) {
      const Component = __webpack_require__(weakId)[name];
      return createElement(Component, props);
    } else {
      const Placeholder = placeholder || exports.ImportPlaceholder;
      return createElement(Placeholder, { ...props, load, name });
    }
  });
};

exports.ImportPlaceholder = class ImportPlaceholder extends Component {
  constructor(placeholderProps) {
    super(placeholderProps);
    const { load, name, ...props } = placeholderProps;
    const state = { loading: null, error: null, Component: null, props };
    load().then(
      ({ [name]: Component }) => this.setState({ ...state, Component }),
      (error) => this.setState({ ...state, error })
    );
    this.state = { ...state, loading: true };
  }
  render() {
    const { Component, props } = this.state;
    return Component ? createElement(Component, props) : null;
  }
};
