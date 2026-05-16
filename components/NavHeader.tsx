'use client';
import Link from 'next/link';
import { useT } from './I18nProvider';
import { LocaleToggle } from './LocaleToggle';

export function NavHeader() {
  const t = useT();
  return (
    <header className="border-b border-neon-purple/10 backdrop-blur-md sticky top-0 z-50 bg-base-900/70">
      <nav className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3">
        <Link href="/" className="font-display text-base md:text-xl tracking-[0.15em] md:tracking-[0.2em] uppercase shrink-0">
          <span className="text-neon-purple">Rimo</span>{' '}
          <span className="text-neon-cyan">Hunter</span>{' '}
          <span className="hidden sm:inline">{t('nav.logo.suffix')}</span>
        </Link>
        <div className="flex items-center gap-3 md:gap-6 text-xs md:text-sm font-display uppercase tracking-widest">
          <Link href="/leaderboard/" className="hover:text-neon-purple transition-colors whitespace-nowrap">{t('nav.ladder')}</Link>
          <Link href="/legends/" className="hover:text-neon-purple transition-colors whitespace-nowrap">{t('nav.legends')}</Link>
          <LocaleToggle />
        </div>
      </nav>
    </header>
  );
}
