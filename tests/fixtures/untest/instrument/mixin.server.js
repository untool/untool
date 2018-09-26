const EventEmitter = require('../../../helpers/promise');

const { Mixin } = require('@untool/core');

const events = new EventEmitter();

class InstrumentMixin extends Mixin {
  constructor(...args) {
    super(...args);
    events.emit('constructor', this, ...args);
  }
  bootstrap(...args) {
    events.emit('bootstrap', ...args);
    return args[0];
  }
  enhanceElement(...args) {
    events.emit('enhanceElement', ...args);
    return args[0];
  }
  fetchData(...args) {
    events.emit('fetchData', ...args);
    return args[0];
  }
  getTemplateData(...args) {
    events.emit('getTemplateData', ...args);
    return args[0];
  }
}

InstrumentMixin.events = events;

module.exports = InstrumentMixin;
