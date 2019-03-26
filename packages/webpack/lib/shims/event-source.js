/* globals window */
if (typeof window.EventSource === 'undefined') {
  window.EventSource = require('eventsource');
}
