const {test} = require('node:test');
const assert = require('node:assert/strict');
const {buildRules} = require('../dist/rules.js');

test('strict/strict block carries both strict headings', () => {
  const out = buildRules({enabled: true, speech: 'strict', code: 'strict'});
  assert.ok(out.startsWith('Output discipline.'));
  assert.match(out, /Speech — caveman speak \(strict/);
  assert.match(out, /Code discipline: strict/);
});

test('normal/normal block carries both normal headings', () => {
  const out = buildRules({enabled: true, speech: 'normal', code: 'normal'});
  assert.match(out, /Speech — normal/);
  assert.match(out, /Code discipline: normal/);
  assert.doesNotMatch(out, /caveman speak/);
});

test('dimensions are independent', () => {
  const out = buildRules({enabled: true, speech: 'normal', code: 'strict'});
  assert.match(out, /Speech — normal/);
  assert.match(out, /Code discipline: strict/);
});

test('every rule line is rendered as a bullet', () => {
  const out = buildRules({enabled: true, speech: 'strict', code: 'strict'});
  assert.ok(out.split('\n').filter(l => l.startsWith('- ')).length > 5);
});
