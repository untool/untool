const { renderToString } = require('react-dom/server');
const {
  Helmet: { renderStatic },
} = require('react-helmet');

module.exports = (element) => {
  const reactMarkup = renderToString(element);
  const fragments = Object.entries(renderStatic()).reduce(
    (result, [key, value]) => ({ ...result, [key]: value.toString() }),
    { reactMarkup, headPrefix: '', headSuffix: '' }
  );
  return fragments;
};
