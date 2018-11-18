require('source-map-support/register');

if (module.hot) {
  module.hot.accept('@untool/entrypoint');
}

module.exports = (...args) => {
  return require('@untool/entrypoint').default(...args);
};
