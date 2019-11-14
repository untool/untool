const { callable } = require('mixinable');
const {
  Mixin,
  internal: { validate },
} = require('../..');

class ValidateMixin extends Mixin {
  validateAndFail() {
    throw new Error('This should not be executed');
  }

  validateAndSucceed() {
    return 'Call result';
  }
}

ValidateMixin.strategies = {
  validateAndFail: validate(callable, () => {
    throw new Error('This is invalid');
  }),
  validateAndSucceed: validate(callable),
};

module.exports = ValidateMixin;
