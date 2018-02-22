import autoBind from 'auto-bind';

export default class Plugin {
  constructor(core, config) {
    this.core = core;
    this.config = config;
    this.options = {};
    if (typeof window === 'undefined') {
      this.server = true;
      this.mode = 'server';
    } else {
      this.browser = true;
      this.mode = 'browser';
    }
    autoBind(this);
  }
}
