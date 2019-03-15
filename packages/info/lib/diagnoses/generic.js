'use strict';

const defaultHandler = (diagnoses, logger) => {
  diagnoses.forEach((diagnosis) => logger.warn(diagnosis));
};

module.exports = class GenericDiagnosisMixin {
  constructor() {
    this.diagnosesMap = new Map();
  }
  submitDiagnosis(handler, ...diagnoses) {
    const { diagnosesMap } = this;
    if (typeof handler !== 'function') {
      if (handler) {
        diagnoses.unshift(handler);
      }
      handler = defaultHandler;
    }
    if (diagnosesMap.has(handler)) {
      diagnosesMap.set(handler, [...diagnosesMap.get(handler), ...diagnoses]);
    } else {
      diagnosesMap.set(handler, diagnoses);
    }
  }
  getDiagnoses() {
    const { diagnosesMap } = this;
    return [].concat(...diagnosesMap.values());
  }
  logDiagnoses(logger) {
    const { diagnosesMap } = this;
    diagnosesMap.forEach((diagnoses, handler) => handler(diagnoses, logger));
  }
};
