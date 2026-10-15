import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { applyLanguage, getLanguage, LANGUAGES, setLanguage, t } from '../i18n';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => getLanguage().code);

  useEffect(() => {
    applyLanguage(lang);
  }, [lang]);

  const change = useCallback((code) => {
    setLanguage(code);
    setLang(code);
  }, []);

  // `lang` is part of the value so every consumer re-renders with the new language.
  const value = useMemo(() => ({ lang, dir: LANGUAGES[lang].dir, setLang: change, t }), [lang, change]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
