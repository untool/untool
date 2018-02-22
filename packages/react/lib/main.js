import { createElement } from 'react';
import { withRouter } from 'react-router';

export function withServer(WrappedComponent) {
  return withRouter(props =>
    createElement(WrappedComponent, {
      ...props,
      setMiss() {
        props.staticContext && (props.staticContext.miss = true);
      },
      setStatus(code) {
        props.staticContext && (props.staticContext.status = code);
      },
      setHeader(name, value) {
        props.staticContext &&
          (props.staticContext.headers = {
            ...props.staticContext.headers,
            [name]: value,
          });
      },
    })
  );
}

export const Miss = withServer(({ setMiss }) => {
  setMiss();
  return null;
});

export const Status = withServer(({ setStatus, code }) => {
  setStatus(code);
  return null;
});

export const Header = withServer(({ setHeader, name, value }) => {
  setHeader(name, value);
  return null;
});
