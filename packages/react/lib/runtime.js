'use strict';
/* global __webpack_modules__, __webpack_require__ */

const { createElement, Component } = require('react');
const { default: withRouter } = require('react-router-dom/es/withRouter');

const { initialize } = require('@untool/core');

exports.render = function render(element, options) {
  return function render(...args) {
    const { render } = initialize({}, element, options);
    if (!render) {
      throw new Error("Can't use @untool/react mixin");
    }
    return render(...args);
  };
};

exports.Miss = withRouter(function Miss({ staticContext }) {
  if (staticContext) {
    staticContext.miss = true;
  }
  return null;
});

exports.Status = withRouter(function Status({ staticContext, code }) {
  if (staticContext) {
    staticContext.status = code;
  }
  return null;
});

exports.Header = withRouter(function Header({ staticContext, name, value }) {
  if (staticContext) {
    staticContext.headers = { ...staticContext.headers, [name]: value };
  }
  return null;
});

exports.Import = ({ load, moduleId }, name = 'default') => {
  const ImportComponent = withRouter(
    class ImportComponent extends Component {
      constructor({ staticContext }) {
        super();
        if (staticContext) {
          staticContext.modules.push(moduleId);
        }
        if (staticContext || __webpack_modules__[moduleId]) {
          this.state = { Component: __webpack_require__(moduleId)[name] };
        } else {
          this.state = { loading: true };
        }
      }
      componentDidMount() {
        const { loader } = this.props;
        const { loading } = this.state;
        if (loading) {
          const state = { Component: null, error: null, loading: false };
          Promise.resolve()
            .then(() => (loader ? loader(load) : load()))
            .then(
              ({ [name]: Component }) => this.setState({ ...state, Component }),
              (error) => this.setState({ ...state, error })
            );
        }
      }
      render() {
        const {
          render = ({ Component, error, loading, ...props }) => {
            return !(error || loading) ? createElement(Component, props) : null;
          },
          ownProps,
        } = this.props;
        return render({ ...ownProps, ...this.state });
      }
    }
  );
  return function Import({ loader, render, ...ownProps }) {
    return createElement(ImportComponent, { loader, render, ownProps });
  };
};
