import type { RawActivityEvent, TierLetter, Breakdown } from './types';

export const ACTION_XP: Record<keyof Breakdown, number> = {
  prsMerged: 10,
  prsOpened: 2,
  reviews: 3,
  issuesClosed: 5,
  issuesOpened: 1,
  commits: 1,
  comments: 0.5,
};

export const RIMO_MULTIPLIER = 1.5;
const RIMO_ORG = 'rimo';

export function xpForEvent(event: RawActivityEvent): number {
  if (!(event.type in ACTION_XP)) return 0;
  const base = ACTION_XP[event.type as keyof Breakdown];
  return event.repoOwner === RIMO_ORG ? base * RIMO_MULTIPLIER : base;
}

export function computeXp(events: RawActivityEvent[]): number {
  return events.reduce((sum, e) => sum + xpForEvent(e), 0);
}

interface TierableEntry {
  login: string;
  xp: number;
  totalCommits?: number;
}

interface RankedEntry extends TierableEntry {
  tier: TierLetter;
  rankNumber: number;
}

const PERCENTILE_CUTOFFS: Array<{ tier: TierLetter; cumulative: number }> = [
  { tier: 'S', cumulative: 0.05 },
  { tier: 'A', cumulative: 0.15 },
  { tier: 'B', cumulative: 0.35 },
  { tier: 'C', cumulative: 0.6 },
  { tier: 'D', cumulative: 0.85 },
  { tier: 'E', cumulative: 1.0 },
];

const FIXED_THRESHOLDS: Array<{ tier: TierLetter; min: number }> = [
  { tier: 'S', min: 500 },
  { tier: 'A', min: 250 },
  { tier: 'B', min: 100 },
  { tier: 'C', min: 40 },
  { tier: 'D', min: 10 },
  { tier: 'E', min: 0 },
];

export function assignTiers(entries: TierableEntry[]): RankedEntry[] {
  const sorted = [...entries].sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    const ac = a.totalCommits ?? 0;
    const bc = b.totalCommits ?? 0;
    if (bc !== ac) return bc - ac;
    return a.login.localeCompare(b.login);
  });

  const usePercentile = sorted.length >= 20;
  return sorted.map((entry, idx) => {
    let tier: TierLetter;
    if (entry.xp <= 0) {
      tier = 'E';
    } else if (usePercentile) {
      const percentile = (idx + 1) / sorted.length;
      tier = PERCENTILE_CUTOFFS.find((c) => percentile <= c.cumulative)!.tier;
    } else {
      tier = FIXED_THRESHOLDS.find((t) => entry.xp >= t.min)!.tier;
    }
    return { ...entry, tier, rankNumber: idx + 1 };
  });
}
