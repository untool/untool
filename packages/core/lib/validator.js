'use strict';

const { isAbsolute } = require('path');

const Ajv = require('ajv');

const configureAjv = (ajv) =>
  ajv.addKeyword('absolutePath', {
    errors: true,
    type: 'string',
    compile(expected, schema) {
      const callback = (data) => {
        if (expected !== isAbsolute(data)) {
          callback.errors = [
            {
              keyword: 'absolutePath',
              params: { absolutePath: data },
              message: `${
                expected ? 'should be' : 'should not be'
              } an absolute path`,
              parentSchema: schema,
            },
          ];
          return false;
        }
        return true;
      };
      callback.errors = [];
      return callback;
    },
  });

exports.validate = (config, properties) => {
  const ajv = new Ajv({ allErrors: true });
  configureAjv(ajv);
  if (ajv.validate({ properties }, config)) {
    return [];
  } else {
    return ajv.errors.map(
      ({ dataPath, message }) => `config${dataPath} ${message}`
    );
  }
};
