/* eslint-disable no-console */

export default class ConsoleLoggerPlugin {
  logInfo(...args) {
    if (
      process.env.NODE_ENV !== 'production' &&
      typeof console !== 'undefined'
    ) {
      console.info(...args);
    }
  }
  logWarn(...args) {
    if (
      process.env.NODE_ENV !== 'production' &&
      typeof console !== 'undefined'
    ) {
      console.warn(...args);
    }
  }
  logError(error) {
    if (
      process.env.NODE_ENV !== 'production' &&
      typeof console !== 'undefined'
    ) {
      console.error(error.stack ? error.stack.toString() : error.toString());
    }
  }
}
