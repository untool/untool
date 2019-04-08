'use strict';

const { EOL } = require('os');

const stripAnsi = require('strip-ansi');

class BuildError extends Error {
  constructor(stack) {
    super();
    this.name = this.constructor.name;
    this.stack = `${this.name}: ${stripAnsi(stack)}`;
    this.message = this.stack.slice(0, this.stack.indexOf(EOL));
  }
}

exports.BuildError = BuildError;
