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
  class ImportPlaceholder extends Component {
    constructor({ load, name }) {
      super();
      const state = { Component: null, error: null, loading: null };
      load().then(
        ({ [name]: Component }) => this.setState({ ...state, Component }),
        (error) => this.setState({ ...state, error })
      );
      this.state = { ...state, loading: true };
    }
    render() {
      const defaultRender = ({ Component, error, loading, ...props }) => {
        return !(error || loading) ? createElement(Component, props) : null;
      };
      const { render = defaultRender, realProps } = this.props;
      return render({ ...realProps, ...this.state });
    }
  }
  return function ImportWrapper({ placeholder, render, ...realProps }) {
    return createElement(
      withRouter(function ImportManager({ staticContext }) {
        if (staticContext) {
          staticContext.modules.push(module);
        }
        if (staticContext || __webpack_modules__[weakId]) {
          const Component = __webpack_require__(weakId)[name];
          return createElement(Component, realProps);
        } else {
          const Placeholder = placeholder || ImportPlaceholder;
          return createElement(Placeholder, { realProps, render, load, name });
        }
      })
    );
  };
};
