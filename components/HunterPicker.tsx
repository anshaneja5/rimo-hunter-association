'use client';
import { useEffect, useRef, useState } from 'react';
import type { MemberProfile } from '@/lib/types';

/**
 * Autocomplete picker for a single hunter. Searchable, keyboard-navigable.
 * Used by the compare page on both sides of the matchup.
 */
export function HunterPicker({
  members,
  value,
  onChange,
  color = '#a855f7',
  placeholder = 'Pick a hunter...',
}: {
  members: MemberProfile[];
  value?: MemberProfile;
  onChange: (m: MemberProfile) => void;
  color?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  const q = query.toLowerCase().replace(/^@/, '');
  const filtered = q
    ? members.filter((m) =>
        m.login.toLowerCase().includes(q) || (m.name ?? '').toLowerCase().includes(q),
      ).slice(0, 12)
    : members.slice(0, 12);

  return (
    <div className="relative w-full" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full glass rounded-xl px-4 py-3 flex items-center gap-3 hover:ring-1 transition"
        style={{ boxShadow: value ? `0 0 24px ${color}33` : undefined }}
      >
        {value ? (
          <>
            <img src={value.avatarUrl} alt={value.login} className="h-10 w-10 rounded-full ring-2" style={{ borderColor: color }} />
            <div className="flex-1 text-left min-w-0">
              <div className="font-display text-sm truncate" style={{ color }}>{value.name ?? value.login}</div>
              <div className="text-[10px] font-mono text-zinc-500 truncate">@{value.login}</div>
            </div>
          </>
        ) : (
          <>
            <div className="h-10 w-10 rounded-full glass border border-dashed border-neon-purple/40 flex items-center justify-center text-neon-purple/60">?</div>
            <span className="font-mono text-sm text-zinc-500">{placeholder}</span>
          </>
        )}
        <svg width="14" height="14" viewBox="0 0 14 14" className="text-zinc-500 shrink-0">
          <path d="M3 5 L7 9 L11 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full glass glass-strong rounded-xl overflow-hidden shadow-2xl">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full px-4 py-3 bg-transparent font-mono text-sm placeholder-zinc-500 focus:outline-none border-b border-neon-purple/10"
          />
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-zinc-500 font-mono text-xs">No matches</div>
            ) : (
              filtered.map((m) => (
                <button
                  key={m.login}
                  type="button"
                  onClick={() => { onChange(m); setOpen(false); setQuery(''); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neon-purple/10 transition text-left"
                >
                  <img src={m.avatarUrl} alt={m.login} className="h-7 w-7 rounded-full ring-1 ring-neon-purple/30" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-display truncate">{m.name ?? m.login}</div>
                    <div className="text-[10px] font-mono text-zinc-500 truncate">@{m.login}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
