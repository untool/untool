const { isAbsolute } = require('path');

function configureAjv(ajv) {
  ajv.addKeyword('absolutePath', {
    errors: true,
    type: 'string',
    compile(expected, schema) {
      function callback(data) {
        if (expected !== isAbsolute(data)) {
          callback.errors = [
            {
              keyword: 'absolutePath',
              params: { absolutePath: data },
              message: `The provided value ${JSON.stringify(data)} ${
                expected ? 'is not' : 'must not be'
              } an absolute path!`,
              parentSchema: schema,
            },
          ];
          return false;
        }
        return true;
      }
      callback.errors = [];

      return callback;
    },
  });
}

module.exports = {
  configureAjv,
};
