'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useT } from './I18nProvider';
import type { TranslationKey } from '@/lib/i18n';
import { LocaleToggle } from './LocaleToggle';

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" className="opacity-80 shrink-0" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <line x1="9.6" y1="9.6" x2="13" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

interface NavItem {
  href: string;
  key: TranslationKey;
  icon?: 'search' | 'fire';
}

const ITEMS: NavItem[] = [
  { href: '/leaderboard/#search', key: 'nav.search', icon: 'search' },
  { href: '/leaderboard/', key: 'nav.ladder' },
  { href: '/rising/', key: 'nav.rising', icon: 'fire' },
  { href: '/squads/', key: 'nav.squads' },
  { href: '/compare/', key: 'nav.compare' },
  { href: '/legends/', key: 'nav.legends' },
];

function ItemIcon({ icon }: { icon?: 'search' | 'fire' }) {
  if (icon === 'search') return <SearchIcon />;
  if (icon === 'fire') return <span className="text-orange-400 text-sm shrink-0">🔥</span>;
  return null;
}

export function NavHeader() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu on navigation.
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on Escape + lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="border-b border-neon-purple/10 backdrop-blur-md sticky top-0 z-50 bg-base-900/70">
      <nav className="relative z-50 max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3">
        <Link href="/" className="font-display text-base md:text-xl tracking-[0.15em] md:tracking-[0.2em] uppercase shrink-0">
          <span className="text-neon-purple">Rimo</span>{' '}
          <span className="text-neon-cyan">Hunter</span>{' '}
          <span className="hidden sm:inline">{t('nav.logo.suffix')}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5 text-sm font-display uppercase tracking-widest">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-neon-purple transition-colors whitespace-nowrap flex items-center gap-1.5"
              aria-label={item.icon === 'search' ? t(item.key) : undefined}
            >
              <ItemIcon icon={item.icon} />
              {/* the search item collapses to just its icon at md, full label from lg */}
              <span className={item.icon === 'search' ? 'hidden lg:inline' : ''}>{t(item.key)}</span>
            </Link>
          ))}
          <LocaleToggle />
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <LocaleToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t('nav.menu.close') : t('nav.menu')}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="relative h-9 w-9 grid place-items-center rounded-lg border border-neon-purple/25 text-zinc-200 hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors"
          >
            <span className="sr-only">{open ? t('nav.menu.close') : t('nav.menu')}</span>
            <span className="relative block w-5 h-3" aria-hidden="true">
              <span className={`absolute left-0 block h-0.5 w-5 bg-current rounded transition-all duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-current rounded transition-all duration-200 ${open ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute left-0 block h-0.5 w-5 bg-current rounded transition-all duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-base-950/70 backdrop-blur-sm"
            />
            <motion.div
              key="panel"
              id="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="md:hidden absolute left-0 right-0 top-full z-50 origin-top border-b border-neon-purple/15 bg-base-950 backdrop-blur-xl shadow-2xl shadow-black/60"
            >
              <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col">
                {ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-3.5 px-2 font-display uppercase tracking-widest text-sm text-zinc-200 hover:text-neon-cyan border-b border-white/5 last:border-b-0 transition-colors"
                  >
                    <span className="w-5 grid place-items-center">
                      <ItemIcon icon={item.icon} />
                    </span>
                    {t(item.key)}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
