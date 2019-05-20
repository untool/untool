'use strict';

const { EOL } = require('os');

const stripAnsi = require('strip-ansi');
const serializeError = require('serialize-error');

class SerializableError extends Error {
  constructor(error) {
    super();
    if (error && typeof error === 'object' && error.message) {
      Object.assign(this, error);
    } else {
      this.message = error;
    }
  }
  toJSON() {
    return serializeError(this);
  }
}

class BuildError extends SerializableError {
  constructor(error) {
    super(error);
    this.name = this.constructor.name;
    if (typeof error === 'string') {
      this.stack = `${this.name}: ${stripAnsi(error)}`;
      this.message = this.stack.slice(0, this.stack.indexOf(EOL));
    }
  }
}

exports.BuildError = BuildError;

class CompilerError extends SerializableError {
  constructor(error) {
    super(error);
    this.name = this.constructor.name;
  }
}

exports.CompilerError = CompilerError;
