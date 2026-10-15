import he from './he';
import ar from './ar';
import en from './en';
import { setLanguage, t } from '.';
import { dayLabel, relativeTime } from '../lib/time';

// Flattens { a: { b: 'x' } } to ['a.b'] so every dictionary can be compared.
function keys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  );
}

const placeholders = (text) => (typeof text === 'string' ? (text.match(/\{\w+\}/g) || []).sort() : []);
const get = (dict, key) => key.split('.').reduce((n, p) => n[p], dict);

describe('dictionaries', () => {
  const heKeys = keys(he).sort();

  it.each([
    ['ar', ar],
    ['en', en],
  ])('%s has exactly the same keys as Hebrew', (name, dict) => {
    expect(keys(dict).sort()).toEqual(heKeys);
  });

  it.each([
    ['ar', ar],
    ['en', en],
  ])('%s uses the same {placeholders}', (name, dict) => {
    heKeys.forEach((key) => {
      expect([key, placeholders(get(dict, key))]).toEqual([key, placeholders(get(he, key))]);
    });
  });
});

describe('t()', () => {
  afterEach(() => setLanguage('he'));

  it('fills in variables', () => {
    setLanguage('en');
    expect(t('today.doneOf', { done: 2, total: 5 })).toBe('2 of 5 done');
    setLanguage('ar');
    expect(t('today.doneOf', { done: 2, total: 5 })).toBe('تمّ 2 من 5');
  });

  it('sets the document direction', () => {
    setLanguage('en');
    expect(document.documentElement.dir).toBe('ltr');
    setLanguage('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
  });

  it('formats relative times in each language', () => {
    const now = new Date(2026, 9, 15, 12, 0);
    const in20 = new Date(2026, 9, 15, 12, 20);
    const tomorrow = new Date(2026, 9, 16, 9, 0);

    setLanguage('en');
    expect(relativeTime(in20, now)).toBe('in 20 minutes');
    expect(dayLabel(tomorrow, now)).toBe('Tomorrow');

    setLanguage('ar');
    expect(dayLabel(tomorrow, now)).toBe('غدًا');
  });
});
