'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { loadMembers, loadStats, findMember } from '@/lib/loadData';
import type { MembersFile, StatsFile, Period, TierLetter } from '@/lib/types';
import { PeriodToggle } from '@/components/PeriodToggle';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { useT } from '@/components/I18nProvider';

const TIERS: TierLetter[] = ['S', 'A', 'B', 'C', 'D', 'E'];
const TIER_COLOR: Record<TierLetter, string> = {
  S: 'text-rank-s',
  A: 'text-rank-a',
  B: 'text-rank-b',
  C: 'text-rank-c',
  D: 'text-rank-d',
  E: 'text-rank-e',
};

export default function LeaderboardPage() {
  const t = useT();
  const [period, setPeriod] = useState<Period>('weekly');
  const [members, setMembers] = useState<MembersFile | null>(null);
  const [stats, setStats] = useState<StatsFile | null>(null);

  useEffect(() => { loadMembers().then(setMembers); }, []);
  useEffect(() => { loadStats(period).then(setStats); }, [period]);

  if (!members || !stats) {
    return (
      <div className="text-center py-24">
        <div className="font-display tracking-[0.3em] text-zinc-500 animate-pulse">{t('leaderboard.loading')}</div>
      </div>
    );
  }

  const maxXp = stats.rankings[0]?.xp ?? 1;
  const rows = stats.rankings
    .map((r) => ({ member: findMember(members.members, r.login)!, ranking: r }))
    .filter((r) => r.member);

  const tierCounts: Record<TierLetter, number> = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (const r of stats.rankings) tierCounts[r.tier]++;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 md:space-y-10"
    >
      {/* HEADER */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-purple/40 to-transparent" />
          <svg width="22" height="22" viewBox="0 0 22 22" className="text-neon-purple shrink-0">
            <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="0.6" opacity="0.5" fill="none" />
            <line x1="11" y1="1" x2="11" y2="4" stroke="currentColor" strokeWidth="0.8" />
            <line x1="11" y1="18" x2="11" y2="21" stroke="currentColor" strokeWidth="0.8" />
            <line x1="1" y1="11" x2="4" y2="11" stroke="currentColor" strokeWidth="0.8" />
            <line x1="18" y1="11" x2="21" y2="11" stroke="currentColor" strokeWidth="0.8" />
          </svg>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-neon-cyan/40 to-transparent" />
        </div>

        <h1 className="font-display font-black text-4xl md:text-6xl uppercase tracking-[0.08em] text-center leading-none">
          <span className="text-white">{t('leaderboard.title.1')}</span>{' '}
          <span className="holo-text">{t('leaderboard.title.2')}</span>
        </h1>

        {/* Tier distribution strip */}
        <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap text-[10px] md:text-xs font-mono uppercase tracking-widest">
          {TIERS.map((tier) => (
            <div key={tier} className="flex items-center gap-1.5 glass px-2.5 py-1 rounded-full">
              <span className={`font-display font-bold ${TIER_COLOR[tier]}`}>{tier}</span>
              <span className="text-zinc-500">{tierCounts[tier]}</span>
            </div>
          ))}
          <div className="text-zinc-500 hidden sm:block">·</div>
          <div className="text-zinc-400">
            <span className="text-white font-bold font-mono">{stats.rankings.length}</span>{' '}
            <span className="text-[10px] uppercase tracking-widest">Hunters</span>
          </div>
        </div>
      </div>

      {/* Period toggle */}
      <section className="flex justify-center">
        <PeriodToggle value={period} onChange={setPeriod} />
      </section>

      <LeaderboardTable rows={rows} maxXp={maxXp} />
    </motion.div>
  );
}
