exports.getAllPropertyNames = function getAllPropertyNames(obj) {
  const props = [];
  do {
    Object.getOwnPropertyNames(obj).forEach(prop => {
      if (props.indexOf(prop) === -1) {
        props.push(prop);
      }
    });
  } while ((obj = Object.getPrototypeOf(obj)));
  return props;
};

exports.getPropertyNames = function getPropertyNames(obj) {
  const defaultProps = exports.getAllPropertyNames({});
  const objProps = exports.getAllPropertyNames(obj);
  return objProps.filter(prop => defaultProps.indexOf(prop) === -1);
};

exports.bindAll = function bindAll(obj) {
  exports.getPropertyNames(obj).forEach(key => {
    if (typeof obj[key] === 'function') {
      obj[key] = obj[key].bind(obj);
    }
  });
};
