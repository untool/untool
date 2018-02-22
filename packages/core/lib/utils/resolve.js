import { create } from 'enhanced-resolve';

const { sync: createResolver } = create;

export function preset(...args) {
  return createResolver({
    extensions: ['.mjs', '.js'],
    mainFiles: ['preset'],
    mainFields: ['esnext:preset', 'jsnext:preset', 'preset'],
  })(...args);
}

export function plugin(target, ...args) {
  try {
    const config = {
      extensions: ['.mjs', '.js'],
      mainFiles: [`plugin.${target}`, 'plugin'],
      mainFields: [
        `esnext:plugin:${target}`,
        `jsnext:plugin:${target}`,
        `plugin:${target}`,
        'esnext:plugin',
        'jsnext:plugin',
        'plugin',
      ],
    };
    if (target !== 'core') {
      config.mainFiles.splice(2, 0, 'plugin.runtime');
      config.mainFields.splice(
        3,
        0,
        'esnext:plugin:runtime',
        'jsnext:plugin:runtime',
        'plugin:runtime'
      );
    }
    return createResolver(config)(...args);
  } catch (_) {
    return null;
  }
}

export function webpack(target, defaults) {
  return {
    ...defaults,
    extensions: ['.mjs', '.js'],
    mainFields: [
      `esnext:${target}`,
      `jsnext:${target}`,
      `${target}`,
      'esnext',
      'jsnext',
      'esnext:main',
      'jsnext:main',
      'module',
      'main',
    ],
  };
}
