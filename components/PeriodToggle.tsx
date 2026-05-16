'use client';
import type { Period } from '@/lib/types';
import { useT } from './I18nProvider';

const PERIODS: Period[] = ['daily', 'weekly', 'monthly', 'all'];

export function PeriodToggle({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const t = useT();
  return (
    <div className="inline-flex gap-1 p-1 rounded-full glass">
      {PERIODS.map((p) => {
        const active = value === p;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-4 py-1.5 rounded-full font-display text-xs uppercase tracking-widest transition-all ${
              active
                ? 'bg-neon-purple text-white shadow-glow-a'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t(`period.${p}` as const)}
          </button>
        );
      })}
    </div>
  );
}
