const { resolve } = require('path');

module.exports = function getModules() {
  const NODE_PATH = process.env.NODE_PATH;
  let modules = ['node_modules'];

  if (NODE_PATH) {
    modules.push(resolve(process.cwd(), NODE_PATH));
  }

  return modules.filter(Boolean);
};
