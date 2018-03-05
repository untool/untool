export function getAllPropertyNames(obj) {
  const props = [];
  do {
    Object.getOwnPropertyNames(obj).forEach(prop => {
      if (props.indexOf(prop) === -1) {
        props.push(prop);
      }
    });
  } while ((obj = Object.getPrototypeOf(obj)));
  return props;
}

export function bindAll(obj) {
  getAllPropertyNames(obj).forEach(key => {
    if (typeof obj[key] === 'function') {
      obj[key] = obj[key].bind(obj);
    }
  });
}
