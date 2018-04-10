const { bindAll } = require('./util');

module.exports = class Mixin {
  constructor(core, config) {
    this.core = core;
    this.config = config;
    this.options = {};
    bindAll(this);
  }
};
