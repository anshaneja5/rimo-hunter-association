'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { MemberProfile, RankingEntry } from '@/lib/types';
import { RankBadge } from './RankBadge';
import { XPBar } from './XPBar';
import { BadgeChip } from './BadgeChip';
import { useT } from './I18nProvider';

interface Row {
  member: MemberProfile;
  ranking: RankingEntry;
}

const TIER_ROW_TINT: Record<RankingEntry['tier'], string> = {
  S: 'md:hover:bg-rank-s/[0.08]',
  A: 'md:hover:bg-rank-a/[0.08]',
  B: 'md:hover:bg-rank-b/[0.06]',
  C: 'md:hover:bg-neon-purple/[0.05]',
  D: 'md:hover:bg-neon-purple/[0.04]',
  E: 'md:hover:bg-neon-purple/[0.04]',
};

const TIER_ACCENT: Record<RankingEntry['tier'], string> = {
  S: 'text-rank-s',
  A: 'text-rank-a',
  B: 'text-rank-b',
  C: 'text-rank-c',
  D: 'text-rank-d',
  E: 'text-rank-e',
};

function RankIndicator({ n, tier }: { n: number; tier: RankingEntry['tier'] }) {
  // Top 3 get medallion-style treatment
  if (n === 1) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-rank-s text-lg drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">♛</span>
        <span className="font-mono font-bold text-rank-s">001</span>
      </div>
    );
  }
  if (n === 2) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-neon-cyan text-lg drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]">⚔</span>
        <span className="font-mono font-bold text-neon-cyan">002</span>
      </div>
    );
  }
  if (n === 3) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-neon-pink text-base drop-shadow-[0_0_6px_rgba(236,72,153,0.5)]">✦</span>
        <span className="font-mono font-bold text-neon-pink">003</span>
      </div>
    );
  }
  return <span className={`font-mono ${TIER_ACCENT[tier]} opacity-70`}>#{String(n).padStart(3, '0')}</span>;
}

export function LeaderboardTable({ rows, maxXp }: { rows: Row[]; maxXp: number }) {
  const t = useT();

  return (
    <>
      {/* --- DESKTOP (md+): table-style layout --- */}
      <div className="hidden md:block glass rounded-2xl overflow-hidden corner-brackets relative">
        <span className="bracket-bl" />
        <span className="bracket-br" />

        {/* Header row */}
        <div className="grid grid-cols-[5rem_1fr_8rem_minmax(10rem,16rem)_6rem_minmax(8rem,1fr)] gap-4 items-center px-6 py-4 border-b border-neon-purple/15 bg-gradient-to-r from-neon-purple/10 via-transparent to-neon-cyan/10">
          <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-display">{t('leaderboard.col.rank')}</div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-display">{t('leaderboard.col.hunter')}</div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-display">{t('leaderboard.col.tier')}</div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-display">{t('leaderboard.col.xp')}</div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-display">{t('leaderboard.col.activity')}</div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-display">{t('leaderboard.col.badges')}</div>
        </div>

        {/* Rows */}
        <div>
          {rows.map((r, idx) => (
            <motion.div
              key={r.member.login}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(idx * 0.012, 0.4), duration: 0.3 }}
              className={`grid grid-cols-[5rem_1fr_8rem_minmax(10rem,16rem)_6rem_minmax(8rem,1fr)] gap-4 items-center px-6 py-3 border-b border-neon-purple/[0.04] transition-colors ${TIER_ROW_TINT[r.ranking.tier]}`}
            >
              <RankIndicator n={r.ranking.rankNumber} tier={r.ranking.tier} />
              <Link href={`/hunter/${r.member.login}/`} className="flex items-center gap-3 group min-w-0">
                <img src={r.member.avatarUrl} alt={r.member.login} className="h-9 w-9 rounded-full ring-1 ring-neon-purple/40 group-hover:ring-2 group-hover:ring-neon-purple transition-all" />
                <span className="font-display tracking-wide group-hover:text-neon-purple transition-colors truncate">
                  {r.member.name ?? r.member.login}
                </span>
              </Link>
              <div><RankBadge tier={r.ranking.tier} size="sm" /></div>
              <div><XPBar xp={r.ranking.xp} max={maxXp} tier={r.ranking.tier} /></div>
              <div><Sparkline data={r.ranking.sparkline} tier={r.ranking.tier} /></div>
              <div className="flex flex-wrap gap-1">
                {r.ranking.badges.slice(0, 3).map((b) => <BadgeChip key={b} id={b} size="sm" />)}
                {r.ranking.badges.length > 3 && (
                  <span className="text-xs font-mono text-zinc-500 self-center">+{r.ranking.badges.length - 3}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- MOBILE (< md): stacked cards --- */}
      <div className="md:hidden space-y-3">
        {rows.map((r, idx) => (
          <motion.div
            key={r.member.login}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.015, 0.4), duration: 0.3 }}
            className="glass rounded-2xl p-4 relative overflow-hidden"
          >
            {/* Tier letter watermark */}
            <div className="absolute -top-3 -right-2 opacity-[0.08] font-display font-black text-[110px] leading-none select-none pointer-events-none">
              {r.ranking.tier}
            </div>

            <div className="flex items-center justify-between mb-3 relative">
              <RankIndicator n={r.ranking.rankNumber} tier={r.ranking.tier} />
              <RankBadge tier={r.ranking.tier} size="sm" />
            </div>

            <Link href={`/hunter/${r.member.login}/`} className="flex items-center gap-3 group mb-3 relative">
              <img src={r.member.avatarUrl} alt={r.member.login} className="h-12 w-12 rounded-full ring-2 ring-neon-purple/40" />
              <div className="min-w-0 flex-1">
                <div className="font-display tracking-wide truncate">{r.member.name ?? r.member.login}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">@{r.member.login}</div>
              </div>
            </Link>

            <div className="mb-2 relative">
              <XPBar xp={r.ranking.xp} max={maxXp} tier={r.ranking.tier} />
            </div>

            {r.ranking.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3 relative">
                {r.ranking.badges.slice(0, 4).map((b) => <BadgeChip key={b} id={b} size="sm" />)}
                {r.ranking.badges.length > 4 && (
                  <span className="text-[10px] font-mono text-zinc-500 self-center px-1">+{r.ranking.badges.length - 4}</span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </>
  );
}

function Sparkline({ data, tier }: { data: number[]; tier: RankingEntry['tier'] }) {
  if (data.length === 0) return null;
  const max = Math.max(1, ...data);
  const w = 80, h = 26;
  const step = w / Math.max(1, data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - (v / max) * (h - 2)}`);
  const polyline = points.join(' ');
  // build a filled polygon for the gradient area
  const area = `0,${h} ${polyline} ${w},${h}`;
  const gradId = `spark-${tier}`;
  const stops: Record<RankingEntry['tier'], { from: string; to: string }> = {
    S: { from: 'rgba(251,191,36,0.55)', to: 'rgba(251,191,36,0)' },
    A: { from: 'rgba(168,85,247,0.55)', to: 'rgba(168,85,247,0)' },
    B: { from: 'rgba(34,211,238,0.55)', to: 'rgba(34,211,238,0)' },
    C: { from: 'rgba(125,211,252,0.45)', to: 'rgba(125,211,252,0)' },
    D: { from: 'rgba(148,163,184,0.35)', to: 'rgba(148,163,184,0)' },
    E: { from: 'rgba(113,113,122,0.3)', to: 'rgba(113,113,122,0)' },
  };
  const strokeColor: Record<RankingEntry['tier'], string> = {
    S: '#fbbf24',
    A: '#a855f7',
    B: '#22d3ee',
    C: '#7dd3fc',
    D: '#94a3b8',
    E: '#71717a',
  };
  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stops[tier].from} />
          <stop offset="100%" stopColor={stops[tier].to} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline fill="none" stroke={strokeColor[tier]} strokeWidth="1.4" strokeLinejoin="round" points={polyline} />
    </svg>
  );
}
