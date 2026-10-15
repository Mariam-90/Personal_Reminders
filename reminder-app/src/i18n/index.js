import he from './he';
import ar from './ar';
import en from './en';

// `locale` drives Intl formatting; Arabic uses Western digits (common in Israel and easier to read).
export const LANGUAGES = {
  he: { code: 'he', label: 'עברית', dir: 'rtl', locale: 'he-IL', speech: 'he-IL', dict: he },
  ar: { code: 'ar', label: 'العربية', dir: 'rtl', locale: 'ar-u-nu-latn', speech: 'ar-SA', dict: ar },
  en: { code: 'en', label: 'English', dir: 'ltr', locale: 'en-GB', speech: 'en-US', dict: en },
};

const STORAGE_KEY = 'pr_lang';

function detect() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGUAGES[saved]) return saved;
  } catch {
    /* ignore */
  }
  const nav = (typeof navigator !== 'undefined' && navigator.language) || '';
  return nav.startsWith('ar') ? 'ar' : 'he';
}

let current = detect();

export const getLanguage = () => LANGUAGES[current];
export const getLocale = () => LANGUAGES[current].locale;

export function applyLanguage(code = current) {
  const lang = LANGUAGES[code];
  document.documentElement.lang = code;
  document.documentElement.dir = lang.dir;
  document.title = lang.dict.app.name;
}

export function setLanguage(code) {
  if (!LANGUAGES[code]) return;
  current = code;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
  applyLanguage(code);
}

function lookup(dict, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dict);
}

/**
 * t('today.doneOf', { done: 2, total: 5 }) -> "2 מתוך 5 בוצעו"
 * Falls back to Hebrew, then to the key itself. Arrays and objects are returned as-is.
 */
export function t(key, vars) {
  let value = lookup(LANGUAGES[current].dict, key);
  if (value === undefined) value = lookup(he, key);
  if (value === undefined) return key;
  if (typeof value !== 'string' || !vars) return value;
  return value.replace(/\{(\w+)\}/g, (m, name) => (vars[name] !== undefined ? String(vars[name]) : m));
}
