'use client';
import type { Period } from '@/lib/types';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'all', label: 'All-Time' },
];

export function PeriodToggle({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="inline-flex gap-1 p-1 rounded-full glass">
      {PERIODS.map((p) => {
        const active = value === p.key;
        return (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            className={`px-4 py-1.5 rounded-full font-display text-xs uppercase tracking-widest transition-all ${
              active
                ? 'bg-neon-purple text-white shadow-glow-a'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
