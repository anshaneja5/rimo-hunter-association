'use client';
import { motion } from 'framer-motion';
import type { TierLetter } from '@/lib/types';

const TIER_GRADIENT: Record<TierLetter, string> = {
  S: 'from-amber-300 via-yellow-400 to-amber-500',
  A: 'from-purple-400 via-fuchsia-500 to-purple-600',
  B: 'from-cyan-300 via-cyan-400 to-sky-500',
  C: 'from-sky-200 via-sky-300 to-cyan-400',
  D: 'from-slate-400 via-slate-500 to-slate-600',
  E: 'from-zinc-600 via-zinc-700 to-zinc-800',
};

export function XPBar({ xp, max, tier }: { xp: number; max: number; tier: TierLetter }) {
  const pct = Math.min(100, Math.max(0, max > 0 ? (xp / max) * 100 : 0));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-display tracking-wider text-zinc-400 mb-1">
        <span>XP</span>
        <span>{Math.round(xp)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-base-700 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${TIER_GRADIENT[tier]}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
