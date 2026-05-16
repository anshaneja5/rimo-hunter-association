'use client';
import { motion } from 'framer-motion';
import { useT } from './I18nProvider';
import { RankBadge } from './RankBadge';
import { BadgeChip } from './BadgeChip';
import { XPBar } from './XPBar';
import { StatRadial } from './StatRadial';
import { RankHistoryChart } from './RankHistoryChart';
import { MagicCircle } from './MagicCircle';
import type { MemberProfile, RankingEntry, TierLetter, Breakdown } from '@/lib/types';

interface Props {
  member: MemberProfile;
  allTime?: RankingEntry;
  weekly?: RankingEntry;
  monthly?: RankingEntry;
  daily?: RankingEntry;
  history: Array<{ weekStart: string; tier: TierLetter; xp: number }>;
  maxXp: { all: number; weekly: number; monthly: number; daily: number };
  orgMax?: Breakdown;
}

const TIER_RING: Record<TierLetter, string> = {
  S: 'ring-rank-s shadow-glow-s',
  A: 'ring-rank-a shadow-glow-a',
  B: 'ring-rank-b shadow-glow-b',
  C: 'ring-rank-c shadow-glow-c',
  D: 'ring-rank-d shadow-glow-d',
  E: 'ring-rank-e shadow-glow-e',
};

const TIER_TINT: Record<TierLetter, string> = {
  S: 'from-rank-s/15',
  A: 'from-rank-a/15',
  B: 'from-rank-b/12',
  C: 'from-rank-c/8',
  D: 'from-rank-d/8',
  E: 'from-rank-e/6',
};

const TIER_ACCENT: Record<TierLetter, string> = {
  S: 'text-rank-s',
  A: 'text-rank-a',
  B: 'text-rank-b',
  C: 'text-rank-c',
  D: 'text-rank-d',
  E: 'text-rank-e',
};

export function HunterProfileView({ member, allTime, weekly, monthly, daily, history, maxXp, orgMax }: Props) {
  const t = useT();
  const tier: TierLetter = allTime?.tier ?? 'E';
  const isTopTier = tier === 'S' || tier === 'A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 md:space-y-8"
    >
      {/* HERO CARD */}
      <div className="relative glass glass-strong rounded-3xl p-6 md:p-10 overflow-hidden corner-brackets scan-sweep">
        <span className="bracket-bl" />
        <span className="bracket-br" />

        {/* Tier-tinted radial wash */}
        <div className={`absolute inset-0 bg-gradient-to-br ${TIER_TINT[tier]} via-transparent to-neon-cyan/8 pointer-events-none`} />

        {/* Diagonal stripe overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 12px, rgba(255,255,255,0.6) 12px 13px)' }}
        />

        {/* Tier watermark */}
        <div className="absolute -top-10 -right-6 md:-top-12 md:-right-12 font-display font-black text-[200px] md:text-[340px] leading-none opacity-[0.08] select-none pointer-events-none">
          {tier}
        </div>

        {/* Hunter label */}
        <div className="absolute top-4 md:top-5 left-5 md:left-6 flex items-center gap-2 font-display text-[10px] md:text-xs uppercase tracking-[0.35em] text-neon-cyan/70">
          <span>◇ HUNTER PROFILE</span>
        </div>

        <div className="relative flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start pt-8">
          {/* Avatar with optional magic circle */}
          <div className="relative shrink-0">
            {isTopTier && (
              <MagicCircle
                size={260}
                className="absolute -inset-6 md:-inset-8 opacity-60"
                color={tier === 'S' ? '#fbbf24' : '#a855f7'}
                accentColor="#22d3ee"
              />
            )}
            <motion.img
              src={member.avatarUrl}
              alt={member.login}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className={`relative h-32 w-32 md:h-44 md:w-44 rounded-full ring-4 ${TIER_RING[tier]}`}
            />
            <div className="absolute inset-0 rounded-full pointer-events-none mix-blend-overlay opacity-40"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 35%, transparent 65%, rgba(34,211,238,0.3) 100%)' }}
            />
          </div>

          {/* Identity + tier + period stats */}
          <div className="relative flex-1 text-center md:text-left min-w-0 w-full">
            <h1 className="font-display font-black text-3xl md:text-5xl tracking-wide mb-1 leading-none holo-text break-words">
              {member.name ?? member.login}
            </h1>
            <div className="text-zinc-400 mb-3 font-mono text-xs md:text-sm">@{member.login}</div>
            {member.bio && <p className="text-zinc-300 mb-4 text-sm md:text-base">{member.bio}</p>}

            <div className="flex items-center justify-center md:justify-start gap-4 mb-5">
              <RankBadge tier={tier} size="lg" />
              <div className="text-left">
                <div className={`font-display uppercase tracking-widest text-sm md:text-base ${TIER_ACCENT[tier]}`}>
                  {t(`tier.${tier}` as const)}
                </div>
                <div className="text-zinc-500 text-[10px] md:text-xs font-mono uppercase tracking-widest">
                  {t('hunter.allTimeRank')} <span className="text-white">#{allTime?.rankNumber ?? '—'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              <PeriodStat label={t('periodLabel.today')}     xp={daily?.xp ?? 0}    tier={daily?.tier ?? 'E'}    max={maxXp.daily} />
              <PeriodStat label={t('periodLabel.thisWeek')}  xp={weekly?.xp ?? 0}   tier={weekly?.tier ?? 'E'}   max={maxXp.weekly} />
              <PeriodStat label={t('periodLabel.thisMonth')} xp={monthly?.xp ?? 0}  tier={monthly?.tier ?? 'E'}  max={maxXp.monthly} />
              <PeriodStat label={t('periodLabel.allTime')}   xp={allTime?.xp ?? 0}  tier={tier}                  max={maxXp.all} highlight />
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="glass rounded-2xl p-5 md:p-6 relative overflow-hidden">
          <h2 className="font-display uppercase tracking-[0.25em] text-xs md:text-sm text-zinc-400 mb-1 flex items-center gap-2">
            <span className="w-1 h-3 bg-neon-purple rounded-full" />
            Stat profile
          </h2>
          <p className="text-[10px] text-zinc-500 mb-3 font-mono">% of org leader per metric</p>
          {allTime && <StatRadial breakdown={allTime.breakdown} orgMax={orgMax} tier={tier} />}
        </div>
        <div className="glass rounded-2xl p-5 md:p-6 relative overflow-hidden">
          <h2 className="font-display uppercase tracking-[0.25em] text-xs md:text-sm text-zinc-400 mb-4 flex items-center gap-2">
            <span className="w-1 h-3 bg-neon-cyan rounded-full" />
            {t('hunter.rankHistory')}
          </h2>
          <RankHistoryChart history={history} />
        </div>
      </div>

      {/* RAW STATS GRID (mono numbers, looks like a stats panel) */}
      {allTime && (
        <div className="glass rounded-2xl p-5 md:p-6">
          <h2 className="font-display uppercase tracking-[0.25em] text-xs md:text-sm text-zinc-400 mb-4 flex items-center gap-2">
            <span className="w-1 h-3 bg-rank-s rounded-full" />
            All-time totals
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            <RawStat n={allTime.breakdown.prsMerged}    label={t('stat.prsMerged')}    color="text-rank-s" />
            <RawStat n={allTime.breakdown.commits}      label={t('stat.commits')}      color="text-neon-purple" />
            <RawStat n={allTime.breakdown.reviews}      label={t('stat.reviews')}      color="text-neon-cyan" />
            <RawStat n={allTime.breakdown.issuesClosed} label={t('stat.issuesClosed')} color="text-neon-pink" />
            <RawStat n={allTime.breakdown.issuesOpened} label="Issues opened"           color="text-rank-c" />
            <RawStat n={Math.round(allTime.xp)}         label={t('stat.xp')}           color="text-white" highlight />
          </div>
        </div>
      )}

      {/* BADGES */}
      {allTime && allTime.badges.length > 0 && (
        <div className="glass rounded-2xl p-5 md:p-6">
          <h2 className="font-display uppercase tracking-[0.25em] text-xs md:text-sm text-zinc-400 mb-4 flex items-center gap-2">
            <span className="w-1 h-3 bg-neon-pink rounded-full" />
            {t('hunter.badgesEarned')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {allTime.badges.map((b) => <BadgeChip key={b} id={b} />)}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function PeriodStat({ label, xp, tier, max, highlight }: { label: string; xp: number; tier: TierLetter; max: number; highlight?: boolean }) {
  return (
    <div className={`glass rounded-xl p-3 ${highlight ? 'ring-1 ring-neon-purple/40' : ''}`}>
      <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1.5 font-display flex justify-between items-center">
        <span>{label}</span>
        <span className="font-mono text-zinc-400">{Math.round(xp).toLocaleString()}</span>
      </div>
      <XPBar xp={xp} max={max} tier={tier} />
    </div>
  );
}

function RawStat({ n, label, color, highlight }: { n: number; label: string; color: string; highlight?: boolean }) {
  return (
    <div className={`text-center p-3 rounded-xl ${highlight ? 'glass ring-1 ring-neon-purple/30' : ''}`}>
      <div className={`font-mono font-bold text-2xl md:text-3xl ${color} leading-none`}>{n.toLocaleString()}</div>
      <div className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-2 font-display">{label}</div>
    </div>
  );
}
