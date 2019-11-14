const { join } = require('path');
const test = require('ava');
const { initialize } = require('..');

test('Should create a explicitly given mixin', (t) => {
  initialize({ mixins: [join(__dirname, 'fixtures', 'test-mixin')] });

  t.truthy(require('./fixtures/test-mixin').mixinCreated);
});

test('Should connect mixins through strategies', (t) => {
  const instance = initialize({
    mixins: [
      join(__dirname, 'fixtures', 'a-mixin'),
      join(__dirname, 'fixtures', 'another-mixin'),
    ],
  });

  t.is(instance.callFirst(), 'execute callSecond');
});

test('Should support override stategie by order of mixins', (t) => {
  const instance1 = initialize({
    mixins: [
      join(__dirname, 'fixtures', 'a-mixin'),
      join(__dirname, 'fixtures', 'another-mixin'),
    ],
  });
  const instance2 = initialize({
    mixins: [
      join(__dirname, 'fixtures', 'another-mixin'),
      join(__dirname, 'fixtures', 'a-mixin'),
    ],
  });

  t.is(instance1.override(), 'from another-mixin');
  t.is(instance2.override(), 'from a-mixin');
});

test('Should support parallel stategie', (t) => {
  const instance = initialize({
    mixins: [
      join(__dirname, 'fixtures', 'a-mixin'),
      join(__dirname, 'fixtures', 'another-mixin'),
    ],
  });

  t.deepEqual(instance.parallel(), ['from a-mixin', 'from another-mixin']);
});

test('Should support pipe stategie', (t) => {
  const instance = initialize({
    mixins: [
      join(__dirname, 'fixtures', 'a-mixin'),
      join(__dirname, 'fixtures', 'another-mixin'),
    ],
  });

  t.is(instance.pipe(''), 'Hello World');
});

test('Should support compose stategie', (t) => {
  const instance = initialize({
    mixins: [
      join(__dirname, 'fixtures', 'a-mixin'),
      join(__dirname, 'fixtures', 'another-mixin'),
    ],
  });

  t.deepEqual(instance.compose({ input: 0 }), {
    'a-mixin': { 'another-mixin': { input: 0 } },
  });
});
