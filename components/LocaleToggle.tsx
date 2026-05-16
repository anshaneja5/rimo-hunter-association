'use client';
import { useLocale, useT } from './I18nProvider';

export function LocaleToggle() {
  const [locale, setLocale] = useLocale();
  const t = useT();
  const next: 'en' | 'ja' = locale === 'en' ? 'ja' : 'en';
  return (
    <button
      onClick={() => setLocale(next)}
      aria-label={t('toggle.aria')}
      className="font-display text-xs uppercase tracking-widest text-zinc-400 hover:text-neon-cyan transition-colors border border-neon-purple/20 rounded-full px-3 py-1"
    >
      {locale === 'en' ? '日本語' : 'EN'}
    </button>
  );
}
