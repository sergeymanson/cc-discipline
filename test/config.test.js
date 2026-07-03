const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readConfig} = require('../dist/config.js');

test('defaults to strict/strict, enabled', () => {
  assert.deepEqual(readConfig({}, []), {enabled: true, speech: 'strict', code: 'strict'});
});

test('reads --flag value form', () => {
  const c = readConfig({}, ['--speech', 'normal', '--code', 'normal']);
  assert.equal(c.speech, 'normal');
  assert.equal(c.code, 'normal');
});

test('reads --flag=value form', () => {
  assert.equal(readConfig({}, ['--speech=normal']).speech, 'normal');
});

test('last occurrence of a flag wins', () => {
  assert.equal(readConfig({}, ['--speech', 'strict', '--speech', 'normal']).speech, 'normal');
});

test('unknown value falls back to default', () => {
  assert.equal(readConfig({}, ['--speech', 'bogus']).speech, 'strict');
  assert.equal(readConfig({}, ['--code', 'lite']).code, 'strict');
});

test('value matching is case-insensitive', () => {
  assert.equal(readConfig({}, ['--code', 'NORMAL']).code, 'normal');
});

test('CC_DISCIPLINE off-values disable the hook', () => {
  for (const v of ['0', 'false', 'off', 'OFF']) {
    assert.equal(readConfig({CC_DISCIPLINE: v}, []).enabled, false, v);
  }
});

test('other CC_DISCIPLINE values keep it enabled', () => {
  assert.equal(readConfig({CC_DISCIPLINE: '1'}, []).enabled, true);
});
