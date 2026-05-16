'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { translations, DEFAULT_LOCALE, type Locale, type TranslationKey } from '@/lib/i18n';

interface Ctx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<Ctx>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (k) => translations[DEFAULT_LOCALE][k],
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = (typeof window !== 'undefined' ? localStorage.getItem('locale') : null) as Locale | null;
    if (stored === 'en' || stored === 'ja') setLocaleState(stored);
  }, []);

  // Keep <html lang> in sync so CSS like html[lang='ja'] .font-display picks the JP display font
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') localStorage.setItem('locale', l);
  };

  const t = (key: TranslationKey) => translations[locale][key] ?? translations.en[key];

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useT() {
  return useContext(I18nContext).t;
}

export function useLocale() {
  const ctx = useContext(I18nContext);
  return [ctx.locale, ctx.setLocale] as const;
}
