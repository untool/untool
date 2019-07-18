const EventEmitter = require('../../../helpers/promise');

const { Mixin } = require('untool');

const events = new EventEmitter();

const emit =
  typeof process.send === 'function' &&
  process.env.IS_UNTOOL_CHILD_PROCESS_COMPILER === 'true'
    ? (...args) =>
        process.send({
          name: 'instrument-mixin-event',
          args,
        })
    : events.emit.bind(events);

process.on('debug-child-message', (message) => {
  if (message.name !== 'instrument-mixin-event') return;
  events.emit(...message.args);
});

class InstrumentMixin extends Mixin {
  constructor(...args) {
    super(...args);
    emit('constructor', this, ...args);
  }
  configureServer(...args) {
    emit('configureServer', ...args);
  }
  inspectServer(...args) {
    emit('inspectServer', ...args);
  }
  configureBuild(...args) {
    emit('configureBuild', ...args);
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
    emit('inspectBuild', ...args);
  }
  registerCommands(...args) {
    emit('registerCommands', ...args);
  }
  handleArguments(...args) {
    emit('handleArguments', ...args);
  }
}

InstrumentMixin.events = events;

module.exports = InstrumentMixin;
