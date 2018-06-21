const EventEmitter = require('../../helpers/promise');

const { Mixin } = require('@untool/core');

const events = new EventEmitter();

class InstrumentMixin extends Mixin {
  constructor(...args) {
    super(...args);
    events.emit('constructor', this, ...args);
  }
  initializeServer(...args) {
    events.emit('initializeServer', ...args);
    return args[0];
  }
  configureServer(...args) {
    events.emit('configureServer', ...args);
    return args[0];
  }
  inspectServer(...args) {
    events.emit('inspectServer', ...args);
    return args[0];
  }
  configureWebpack(...args) {
    events.emit('configureWebpack', ...args);
    return args[0];
  }
  inspectBuild(...args) {
    events.emit('inspectBuild', ...args);
    return args[0];
  }
  registerCommands(...args) {
    events.emit('registerCommands', ...args);
    return args[0];
  }
  handleArguments(...args) {
    events.emit('handleArguments', ...args);
    return args[0];
  }
}

InstrumentMixin.events = events;

module.exports = InstrumentMixin;
