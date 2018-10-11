'use strict';

const { ...strategies } = require('mixinable');

module.exports = {
  ...require('@untool/core'),
  ...require('@untool/react'),
  strategies,
};
