'use strict';
/* eslint-env browser */

if (typeof window.EventSource === 'undefined') {
  window.EventSource = require('eventsource');
}

require('webpack-hot-middleware/client');

require('./build');
