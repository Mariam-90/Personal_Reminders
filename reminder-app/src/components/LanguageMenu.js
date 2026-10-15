import React, { useEffect, useRef, useState } from 'react';
import { LANGUAGES } from '../i18n';
import { useI18n } from '../context/I18nContext';

// Compact 🌐 button that opens a small list of languages.
export default function LanguageMenu() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (code) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <div className="lang-menu" ref={ref}>
      <button
        type="button"
        className="lang-toggle"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('language.label')}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">🌐</span>
        <span className="lang-current">{LANGUAGES[lang].label}</span>
      </button>
      {open && (
        <ul className="lang-list" role="listbox" aria-label={t('language.label')}>
          {Object.values(LANGUAGES).map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={lang === l.code}
                className={lang === l.code ? 'active' : ''}
                lang={l.code}
                dir={l.dir}
                onClick={() => choose(l.code)}
              >
                {l.label}
                {lang === l.code && <span aria-hidden="true">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
