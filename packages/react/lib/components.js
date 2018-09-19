'use strict';
/* global __webpack_modules__, __webpack_require__ */

const { createElement, PureComponent } = require('react');
const { withRouter } = require('react-router-dom');

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

exports.Import = ({ loader, loading, weakId, module }) =>
  withRouter(
    class Split extends PureComponent {
      constructor({ staticContext }) {
        super();
        if (__webpack_modules__[weakId] || staticContext) {
          this.state = {
            Component: ((m) => m.default || m)(__webpack_require__(weakId)),
          };
          if (staticContext) {
            staticContext.modules.push({ weakId, module });
          }
        } else {
          this.state = { Component: loading };
          loader().then(
            (module) => this.setState({ Component: module.default || module }),
            (error) => this.setState({ Component: loading, error })
          );
        }
      }
      render() {
        const { Component, error } = this.state;
        return createElement(Component, { error });
      }
    }
  );
