import autoBind from 'auto-bind';

export default class Plugin {
  constructor(core, config, utils) {
    this.core = core;
    this.config = config;
    this.utils = utils;
    this.options = {};
    this.build = true;
    this.mode = 'build';
    autoBind(this);
  }
}
