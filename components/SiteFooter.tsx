'use client';
import { useT } from './I18nProvider';

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="border-t border-neon-purple/10 mt-24 py-8 text-center text-xs text-zinc-500 tracking-widest uppercase">
      {t('footer.tagline')}
    </footer>
  );
}
