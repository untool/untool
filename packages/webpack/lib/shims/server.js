import 'source-map-support/register';

import entryPoint from '@untool/entrypoint';

if (module.hot) {
  module.hot.accept('@untool/entrypoint');
}

export default (...args) => {
  return entryPoint(...args);
};
