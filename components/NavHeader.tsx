'use client';
import Link from 'next/link';
import { useT } from './I18nProvider';
import { LocaleToggle } from './LocaleToggle';

export function NavHeader() {
  const t = useT();
  return (
    <header className="border-b border-neon-purple/10 backdrop-blur-md sticky top-0 z-50 bg-base-900/60">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl tracking-[0.2em] uppercase">
          <span className="text-neon-purple">Rimo</span>{' '}
          <span className="text-neon-cyan">Hunter</span>{' '}
          <span>{t('nav.logo.suffix')}</span>
        </Link>
        <div className="flex items-center gap-4 md:gap-6 text-sm font-display uppercase tracking-widest">
          <Link href="/leaderboard/" className="hover:text-neon-purple transition-colors">{t('nav.ladder')}</Link>
          <Link href="/legends/" className="hover:text-neon-purple transition-colors">{t('nav.legends')}</Link>
          <LocaleToggle />
        </div>
      </nav>
    </header>
  );
}
