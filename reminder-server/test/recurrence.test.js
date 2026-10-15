const test = require('node:test');
const assert = require('node:assert');
const { nextOccurrence } = require('../lib/recurrence');

test('daily: next day at the same time', () => {
  const from = new Date(2026, 9, 15, 9, 0);
  const next = nextOccurrence(from, 'daily', new Date(2026, 9, 15, 10, 0));
  assert.deepStrictEqual(next, new Date(2026, 9, 16, 9, 0));
});

test('daily: skips days that were missed', () => {
  const from = new Date(2026, 9, 10, 9, 0);
  const next = nextOccurrence(from, 'daily', new Date(2026, 9, 15, 10, 0));
  assert.deepStrictEqual(next, new Date(2026, 9, 16, 9, 0));
});

test('weekly and monthly', () => {
  const from = new Date(2026, 0, 31, 8, 30);
  assert.deepStrictEqual(nextOccurrence(from, 'weekly', from), new Date(2026, 1, 7, 8, 30));
  assert.strictEqual(nextOccurrence(from, 'monthly', from).getMonth(), 2); // Feb 31 rolls into March
});

test('none: no next occurrence', () => {
  assert.strictEqual(nextOccurrence(new Date(), 'none'), null);
});
