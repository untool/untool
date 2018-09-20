import { getConfigAndMixins } from './loader';
import entryPoint from '@untool/entrypoint';

(function render() {
  const { config, mixins } = getConfigAndMixins();

  entryPoint(config, mixins)();

  if (module.hot) {
    module.hot.accept('@untool/entrypoint', function() {
      setTimeout(render);
    });
  }
})();
