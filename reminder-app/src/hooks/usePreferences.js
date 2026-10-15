import { useCallback, useEffect, useState } from 'react';

const KEY = 'pr_prefs';
const DEFAULTS = { largeText: false, highContrast: false };

function load() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return DEFAULTS;
  }
}

// Display preferences live on this device (a shared tablet may need bigger text than a phone).
export function applyPreferences(prefs = load()) {
  document.documentElement.classList.toggle('large-text', prefs.largeText);
  document.documentElement.classList.toggle('high-contrast', prefs.highContrast);
}

export default function usePreferences() {
  const [prefs, setPrefs] = useState(load);

  useEffect(() => {
    applyPreferences(prefs);
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs]);

  const setPref = useCallback((name, value) => setPrefs((p) => ({ ...p, [name]: value })), []);
  return [prefs, setPref];
}
