'use strict';

const {
  async: { parallel },
} = require('mixinable');

const {
  Mixin,
  internal: { validate, invariant },
} = require('@untool/core');

const { createDoctor } = require('../../lib/doctor');

class DoctorMixin extends Mixin {
  constructor(...args) {
    super(...args);
    this.doctor = createDoctor(this.config);
  }
  diagnose({ diagnoseConfig, diagnoseDuplicatePackages }) {
    diagnoseConfig();
    diagnoseDuplicatePackages('@untool/*');
  }
  bootstrap() {
    const { doctor } = this;
    return this.diagnose(doctor).then((results) =>
      doctor.submitDiagnosis(
        ...[].concat(...results.filter((result) => result !== undefined))
      )
    );
  }
  handleArguments() {
    const { doctor } = this;
    const logger = this.getLogger();
    doctor.logDiagnoses(logger);
  }
}

DoctorMixin.strategies = {
  diagnose: validate(parallel, ([doctor]) =>
    invariant(
      doctor instanceof createDoctor,
      'diagnose(): Received invalid doctor argument'
    )
  ),
};

module.exports = DoctorMixin;
