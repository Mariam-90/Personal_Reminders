import React from 'react';
import { LANGUAGES } from '../i18n';
import { useI18n } from '../context/I18nContext';

export default function LanguagePicker() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="segmented lang-picker" role="radiogroup" aria-label={t('language.label')}>
      {Object.values(LANGUAGES).map((l) => (
        <button
          key={l.code}
          type="button"
          role="radio"
          aria-checked={lang === l.code}
          className={lang === l.code ? 'active' : ''}
          lang={l.code}
          dir={l.dir}
          onClick={() => setLang(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
