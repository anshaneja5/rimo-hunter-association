'use client';
import { useEffect, useRef } from 'react';
import { useT } from './I18nProvider';

export function HunterSearch({
  value,
  onChange,
  autoFocusOnMount,
  resultCount,
  totalCount,
}: {
  value: string;
  onChange: (v: string) => void;
  autoFocusOnMount?: boolean;
  resultCount?: number;
  totalCount?: number;
}) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocusOnMount) inputRef.current?.focus();
  }, [autoFocusOnMount]);

  // Cmd/Ctrl + K focus shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        onChange('');
        inputRef.current?.blur();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onChange]);

  const showingMatchHint = value.length > 0 && resultCount !== undefined && totalCount !== undefined;

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
          width="16" height="16" viewBox="0 0 16 16"
        >
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" fill="none" />
          <line x1="10.6" y1="10.6" x2="14" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          id="hunter-search"
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('leaderboard.search.placeholder')}
          className="w-full pl-11 pr-20 py-3 glass rounded-full font-mono text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-neon-purple/60 transition"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-[10px] font-mono text-zinc-500 px-2 py-0.5 rounded border border-neon-purple/20 bg-base-800/60">
          ⌘K
        </kbd>
      </div>
      {showingMatchHint && (
        <div className="mt-2 text-center text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          {resultCount === 0 ? (
            <span className="text-rank-e">{t('leaderboard.search.empty')}</span>
          ) : (
            <>
              <span className="text-neon-cyan font-bold">{resultCount}</span>
              {' / '}
              <span>{totalCount}</span>
              {' '}
              <span>{t('leaderboard.search.results')}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
