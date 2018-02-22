import Plugin from '../runtime';

export default class RenderFallbackPlugin extends Plugin {
  render() {
    this.core.logWarn('No render plugin installed, using fallback.');
  }
}
