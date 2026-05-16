import type { TierLetter } from '@/lib/types';

const TIER_LABEL: Record<TierLetter, string> = {
  S: 'Shadow Monarch',
  A: 'Awakened',
  B: 'Elite Hunter',
  C: 'Hunter',
  D: 'Apprentice',
  E: 'Aspirant',
};

const TIER_STYLES: Record<TierLetter, string> = {
  S: 'bg-rank-s/20 text-rank-s shadow-glow-s ring-1 ring-rank-s/60 bg-[linear-gradient(110deg,transparent_30%,rgba(251,191,36,0.4)_50%,transparent_70%)] bg-[length:200%_100%] animate-shimmer',
  A: 'bg-rank-a/20 text-rank-a shadow-glow-a ring-1 ring-rank-a/60',
  B: 'bg-rank-b/20 text-rank-b shadow-glow-b ring-1 ring-rank-b/60',
  C: 'bg-rank-c/20 text-rank-c shadow-glow-c ring-1 ring-rank-c/40',
  D: 'bg-rank-d/15 text-rank-d shadow-glow-d ring-1 ring-rank-d/40',
  E: 'bg-rank-e/15 text-rank-e shadow-glow-e ring-1 ring-rank-e/40',
};

export function RankBadge({ tier, size = 'md', showLabel = false }: {
  tier: TierLetter;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}) {
  const sizes = {
    sm: 'h-7 w-7 text-sm',
    md: 'h-10 w-10 text-lg',
    lg: 'h-16 w-16 text-3xl',
  };
  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`font-display font-bold rounded-md flex items-center justify-center ${sizes[size]} ${TIER_STYLES[tier]}`}
      >
        {tier}
      </div>
      {showLabel && (
        <span className="font-display uppercase tracking-wider text-sm text-zinc-300">{TIER_LABEL[tier]}</span>
      )}
    </div>
  );
}

export { TIER_LABEL };
