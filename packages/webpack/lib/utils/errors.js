'use strict';

const { EOL } = require('os');

class BuildError extends Error {
  constructor(stack) {
    super();
    this.name = this.constructor.name;
    this.stack = `${this.name}: ${stack.replace(/\033?\[[0-9]{1,2}m/g, '')}`;
    this.message = this.stack.slice(0, this.stack.indexOf(EOL));
  }
}

exports.BuildError = BuildError;
