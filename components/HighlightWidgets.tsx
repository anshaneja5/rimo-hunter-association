'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { MembersFile, StatsFile, RankingEntry } from '@/lib/types';

const TIER_HEX: Record<RankingEntry['tier'], string> = {
  S: '#fbbf24',
  A: '#a855f7',
  B: '#22d3ee',
  C: '#7dd3fc',
  D: '#94a3b8',
  E: '#71717a',
};

/**
 * Two side-by-side highlight cards on the landing page:
 *  - 🔥 On Fire — top current commit streaks (needs streak data; degrades gracefully if absent)
 *  - ⚡ Rising Stars — biggest weekly XP multipliers vs the user's typical week
 */
export function HighlightWidgets({
  members,
  allTimeStats,
  weeklyStats,
}: {
  members: MembersFile;
  allTimeStats: StatsFile;
  weeklyStats: StatsFile;
}) {
  // On Fire — top 3 by currentStreak (filter to >= 3 days; less than that is noise)
  const onFire = allTimeStats.rankings
    .filter((r) => (r.currentStreak ?? 0) >= 3)
    .sort((a, b) => (b.currentStreak ?? 0) - (a.currentStreak ?? 0))
    .slice(0, 3);

  // Rising Stars — for each user with meaningful all-time XP, compute weekly multiplier
  // vs their typical week (allTime / 52). Multiplier ≥ 3x is "rising".
  const allTimeByLogin = new Map(allTimeStats.rankings.map((r) => [r.login, r]));
  const rising = weeklyStats.rankings
    .map((w) => {
      const all = allTimeByLogin.get(w.login);
      if (!all || all.xp < 100) return null;     // filter out tiny accounts
      if (w.xp < 30) return null;                 // need at least some weekly activity
      const typicalWeek = all.xp / 52;
      if (typicalWeek <= 0) return null;
      const multiplier = w.xp / typicalWeek;
      if (multiplier < 1.5) return null;
      return { login: w.login, weeklyXp: w.xp, multiplier, tier: w.tier };
    })
    .filter((x): x is { login: string; weeklyXp: number; multiplier: number; tier: RankingEntry['tier'] } => !!x)
    .sort((a, b) => b.multiplier - a.multiplier)
    .slice(0, 3);

  const showOnFire = onFire.length > 0;
  const showRising = rising.length > 0;
  if (!showOnFire && !showRising) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {showOnFire && (
        <Widget
          title="On Fire"
          subtitle="Longest active streaks"
          icon={<span className="text-2xl drop-shadow-[0_0_10px_rgba(251,146,60,0.7)]">🔥</span>}
          accentColor="#fb923c"
        >
          {onFire.map((r, idx) => {
            const member = members.members.find((m) => m.login === r.login);
            if (!member) return null;
            return (
              <HighlightRow
                key={r.login}
                idx={idx}
                member={member}
                tier={r.tier}
                primary={`${r.currentStreak} day${r.currentStreak === 1 ? '' : 's'}`}
                secondary={`peak ${r.longestStreak ?? r.currentStreak}d`}
              />
            );
          })}
        </Widget>
      )}

      {showRising && (
        <Widget
          title="Rising Stars"
          subtitle="Biggest weekly surge vs typical pace"
          icon={<span className="text-2xl drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]">⚡</span>}
          accentColor="#22d3ee"
        >
          {rising.map((r, idx) => {
            const member = members.members.find((m) => m.login === r.login);
            if (!member) return null;
            return (
              <HighlightRow
                key={r.login}
                idx={idx}
                member={member}
                tier={r.tier}
                primary={`${r.multiplier.toFixed(1)}×`}
                secondary={`${Math.round(r.weeklyXp).toLocaleString()} XP this week`}
              />
            );
          })}
        </Widget>
      )}
    </div>
  );
}

function Widget({
  title, subtitle, icon, accentColor, children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-5 md:p-6 relative overflow-hidden"
      style={{ boxShadow: `inset 0 0 40px ${accentColor}11` }}
    >
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none opacity-10"
        style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
      />
      <div className="flex items-center gap-3 mb-4 relative">
        {icon}
        <div>
          <h3 className="font-display uppercase tracking-[0.25em] text-sm font-bold" style={{ color: accentColor }}>{title}</h3>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-2 relative">
        {children}
      </div>
    </motion.div>
  );
}

function HighlightRow({
  idx, member, tier, primary, secondary,
}: {
  idx: number;
  member: { login: string; name: string | null; avatarUrl: string };
  tier: RankingEntry['tier'];
  primary: string;
  secondary: string;
}) {
  return (
    <Link
      href={`/hunter/${member.login}/`}
      className="flex items-center gap-3 p-2 rounded-xl hover:bg-neon-purple/5 transition group"
    >
      <span className="font-mono text-zinc-500 text-xs w-5 text-right">{idx + 1}</span>
      <img
        src={member.avatarUrl}
        alt={member.login}
        className="h-9 w-9 rounded-full ring-1 group-hover:scale-105 transition-transform"
        style={{ borderColor: TIER_HEX[tier], boxShadow: `0 0 12px ${TIER_HEX[tier]}55` }}
      />
      <div className="flex-1 min-w-0">
        <div className="font-display text-sm truncate">{member.name ?? member.login}</div>
        <div className="text-[10px] font-mono text-zinc-500 truncate">{secondary}</div>
      </div>
      <div className="font-mono font-bold text-sm md:text-base whitespace-nowrap" style={{ color: TIER_HEX[tier] }}>
        {primary}
      </div>
    </Link>
  );
}
