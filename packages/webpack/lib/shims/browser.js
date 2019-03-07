import entryPoint from '@untool/entrypoint';

entryPoint();

if (module.hot) {
  module.hot.accept('@untool/entrypoint', () => entryPoint());
}
