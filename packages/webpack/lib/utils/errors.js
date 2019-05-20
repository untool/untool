'use strict';

const stripAnsi = require('strip-ansi');
const { serializeError } = require('serialize-error');

class SerializableError extends Error {
  constructor(error) {
    super();
    if (error && typeof error === 'object' && error.message) {
      Object.assign(this, error);
    } else {
      this.message = error.toString();
    }
    this.message = stripAnsi(this.message);
    if (!this.name) {
      this.name = this.constructor.name;
    }
  }
  toJSON() {
    return serializeError(this);
  }
}

exports.SerializableError = SerializableError;
