const EventEmitter = require('../../../helpers/promise');

const { Mixin } = require('untool');

const events = new EventEmitter();

class InstrumentMixin extends Mixin {
  constructor(...args) {
    super(...args);
    events.emit('constructor', this, ...args);
  }
  configureServer(...args) {
    events.emit('configureServer', ...args);
  }
  inspectServer(...args) {
    events.emit('inspectServer', ...args);
  }
  configureBuild(...args) {
    events.emit('configureBuild', ...args);
    const [webpackConfig, , { target }] = args;
    if (target === 'server') {
      webpackConfig.externals = [
        function(context, request, callback) {
          if (request.includes(__dirname)) {
            return callback(null, 'commonjs ' + request);
          }
          callback();
        },
      ];
    }
  }
  inspectBuild(...args) {
    events.emit('inspectBuild', ...args);
  }
  registerCommands(...args) {
    events.emit('registerCommands', ...args);
  }
  handleArguments(...args) {
    events.emit('handleArguments', ...args);
  }
}

InstrumentMixin.events = events;

module.exports = InstrumentMixin;
