// eslint-disable-next-line no-unused-vars
import React from 'react';

import { createStore } from 'redux';
import { Provider } from 'react-redux';

const store = createStore((state = {}) => state);

export default () => (
  <Provider store={store}>
    <h1>Home</h1>
  </Provider>
);
