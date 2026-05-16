'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { loadMembers, loadStats } from '@/lib/loadData';
import type { MembersFile, StatsFile, MemberProfile, RankingEntry, Breakdown, TierLetter } from '@/lib/types';
import { useT } from '@/components/I18nProvider';
import { HunterPicker } from '@/components/HunterPicker';
import { RankBadge } from '@/components/RankBadge';
import { CompareRadar } from '@/components/CompareRadar';

const TIER_HEX: Record<TierLetter, string> = {
  S: '#fbbf24',
  A: '#a855f7',
  B: '#22d3ee',
  C: '#7dd3fc',
  D: '#94a3b8',
  E: '#71717a',
};

export default function ComparePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CompareInner />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="text-center py-24">
      <div className="font-display tracking-[0.3em] text-zinc-500 animate-pulse">Loading...</div>
    </div>
  );
}

function CompareInner() {
  useT(); // keeps the locale subscription alive even though most strings here are display-only
  const search = useSearchParams();
  const [members, setMembers] = useState<MembersFile | null>(null);
  const [stats, setStats] = useState<StatsFile | null>(null);
  const [a, setA] = useState<MemberProfile | undefined>();
  const [b, setB] = useState<MemberProfile | undefined>();

  useEffect(() => { loadMembers().then(setMembers); }, []);
  useEffect(() => { loadStats('all').then(setStats); }, []);

  // Hydrate selections from URL once members are loaded
  useEffect(() => {
    if (!members) return;
    const lA = search.get('a');
    const lB = search.get('b');
    if (lA) setA(members.members.find((m) => m.login === lA));
    if (lB) setB(members.members.find((m) => m.login === lB));
  }, [members, search]);

  // Push selections back into URL (without scrolling)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (a) params.set('a', a.login);
    if (b) params.set('b', b.login);
    const url = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [a, b]);

  const orgMax = useMemo(() => buildOrgMax(stats), [stats]);
  const rankA = useMemo(() => a && stats ? stats.rankings.find((r) => r.login === a.login) : undefined, [a, stats]);
  const rankB = useMemo(() => b && stats ? stats.rankings.find((r) => r.login === b.login) : undefined, [b, stats]);

  if (!members || !stats) return <LoadingState />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 md:space-y-10"
    >
      {/* HEADER */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-purple/40 to-transparent" />
          <svg width="28" height="22" viewBox="0 0 28 22" className="text-neon-purple shrink-0">
            {/* crossed katanas */}
            <line x1="2" y1="2" x2="26" y2="20" stroke="currentColor" strokeWidth="1.4" />
            <line x1="26" y1="2" x2="2" y2="20" stroke="currentColor" strokeWidth="1.4" />
            <rect x="0" y="0" width="3" height="3" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <rect x="25" y="0" width="3" height="3" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <rect x="0" y="19" width="3" height="3" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <rect x="25" y="19" width="3" height="3" stroke="currentColor" strokeWidth="0.8" fill="none" />
          </svg>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-neon-cyan/40 to-transparent" />
        </div>
        <h1 className="font-display font-black text-4xl md:text-6xl uppercase tracking-[0.08em] text-center leading-none">
          <span className="text-white">Hunter</span>{' '}
          <span className="holo-text">Showdown</span>
        </h1>
        <p className="text-center font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-zinc-500">
          Pick two · see who wins the most metrics
        </p>
      </div>

      {/* PICKERS */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-center">
        <HunterPicker members={members.members} value={a} onChange={setA} color="#a855f7" placeholder="Pick hunter A..." />
        <div className="font-display font-black text-3xl md:text-5xl text-zinc-500 text-center select-none">VS</div>
        <HunterPicker members={members.members} value={b} onChange={setB} color="#22d3ee" placeholder="Pick hunter B..." />
      </div>

      {/* COMPARISON */}
      {a && b && rankA && rankB ? (
        <Showdown a={a} b={b} rankA={rankA} rankB={rankB} orgMax={orgMax} />
      ) : (
        <div className="glass rounded-2xl py-16 px-6 text-center">
          <svg width="48" height="48" viewBox="0 0 48 48" className="text-zinc-600 mx-auto mb-4">
            <circle cx="14" cy="24" r="8" stroke="currentColor" strokeWidth="1.4" fill="none" />
            <circle cx="34" cy="24" r="8" stroke="currentColor" strokeWidth="1.4" fill="none" />
            <line x1="22" y1="24" x2="26" y2="24" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <div className="font-display uppercase tracking-[0.25em] text-sm text-zinc-400">
            Choose two hunters to begin
          </div>
          <div className="text-xs text-zinc-500 mt-2 font-mono">
            Comparing stat profiles, XP, and tier
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Showdown({
  a, b, rankA, rankB, orgMax,
}: {
  a: MemberProfile;
  b: MemberProfile;
  rankA: RankingEntry;
  rankB: RankingEntry;
  orgMax?: Breakdown;
}) {
  const metrics: Array<{ key: keyof Breakdown | 'xp'; label: string }> = [
    { key: 'xp',           label: 'Total XP' },
    { key: 'commits',      label: 'Commits' },
    { key: 'prsMerged',    label: 'PRs merged' },
    { key: 'prsOpened',    label: 'PRs opened' },
    { key: 'reviews',      label: 'Reviews' },
    { key: 'issuesClosed', label: 'Issues closed' },
    { key: 'issuesOpened', label: 'Issues opened' },
  ];

  function val(r: RankingEntry, k: keyof Breakdown | 'xp'): number {
    return k === 'xp' ? Math.round(r.xp) : r.breakdown[k];
  }

  // Verdict count
  let winsA = 0, winsB = 0, ties = 0;
  for (const m of metrics) {
    const va = val(rankA, m.key); const vb = val(rankB, m.key);
    if (va > vb) winsA++;
    else if (vb > va) winsB++;
    else ties++;
  }
  const verdictWinner = winsA === winsB ? null : winsA > winsB ? a : b;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-6">
        <HunterHero member={a} ranking={rankA} color="#a855f7" align="left" />
        <HunterHero member={b} ranking={rankB} color="#22d3ee" align="right" />
      </div>

      {/* Verdict pill */}
      <div className="flex justify-center">
        <div className="glass rounded-full px-5 py-2 flex items-center gap-3 md:gap-4 font-mono text-xs md:text-sm">
          <span className="text-neon-purple font-bold">{winsA}</span>
          <span className="text-zinc-500">·</span>
          {ties > 0 && (<>
            <span className="text-zinc-400">{ties} tie{ties === 1 ? '' : 's'}</span>
            <span className="text-zinc-500">·</span>
          </>)}
          <span className="text-neon-cyan font-bold">{winsB}</span>
          {verdictWinner && (
            <>
              <span className="text-zinc-500 hidden sm:inline">·</span>
              <span className="font-display uppercase tracking-widest text-[10px] md:text-xs hidden sm:inline">
                <span style={{ color: verdictWinner === a ? '#a855f7' : '#22d3ee' }}>
                  {verdictWinner.name ?? verdictWinner.login}
                </span>{' '}
                pulls ahead
              </span>
            </>
          )}
        </div>
      </div>

      {/* Stat showdown bars */}
      <div className="glass rounded-2xl p-5 md:p-6 space-y-4">
        <h2 className="font-display uppercase tracking-[0.25em] text-xs md:text-sm text-zinc-400 flex items-center gap-2">
          <span className="w-1 h-3 bg-neon-purple rounded-full" />
          Head to head
        </h2>
        {metrics.map((m) => {
          const va = val(rankA, m.key); const vb = val(rankB, m.key);
          const max = Math.max(va, vb, 1);
          const pctA = (va / max) * 100;
          const pctB = (vb / max) * 100;
          return (
            <div key={m.key} className="grid grid-cols-[1fr_minmax(5rem,auto)_1fr] gap-2 md:gap-4 items-center">
              <div className="flex justify-end items-center gap-2 min-w-0">
                <span className={`font-mono font-bold text-base md:text-lg ${va > vb ? 'text-neon-purple' : 'text-zinc-500'}`}>
                  {va.toLocaleString()}
                </span>
                <div className="flex-1 h-2 bg-base-700 rounded-l-full overflow-hidden max-w-[60%]">
                  <div
                    className="h-full rounded-l-full transition-all"
                    style={{
                      width: `${pctA}%`,
                      marginLeft: `${100 - pctA}%`,
                      background: 'linear-gradient(to left, rgba(168,85,247,0.9), rgba(168,85,247,0.2))',
                    }}
                  />
                </div>
              </div>
              <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-zinc-500 text-center font-display whitespace-nowrap">
                {m.label}
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex-1 h-2 bg-base-700 rounded-r-full overflow-hidden max-w-[60%]">
                  <div
                    className="h-full rounded-r-full transition-all"
                    style={{
                      width: `${pctB}%`,
                      background: 'linear-gradient(to right, rgba(34,211,238,0.9), rgba(34,211,238,0.2))',
                    }}
                  />
                </div>
                <span className={`font-mono font-bold text-base md:text-lg ${vb > va ? 'text-neon-cyan' : 'text-zinc-500'}`}>
                  {vb.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Radar overlay */}
      <div className="glass rounded-2xl p-5 md:p-6">
        <h2 className="font-display uppercase tracking-[0.25em] text-xs md:text-sm text-zinc-400 mb-4 flex items-center gap-2">
          <span className="w-1 h-3 bg-neon-cyan rounded-full" />
          Stat profile overlay
        </h2>
        <CompareRadar
          a={rankA.breakdown}
          b={rankB.breakdown}
          labelA={a.name ?? a.login}
          labelB={b.name ?? b.login}
          colorA="#a855f7"
          colorB="#22d3ee"
          orgMax={orgMax}
        />
      </div>
    </div>
  );
}

function HunterHero({
  member, ranking, color, align,
}: {
  member: MemberProfile;
  ranking: RankingEntry;
  color: string;
  align: 'left' | 'right';
}) {
  return (
    <Link
      href={`/hunter/${member.login}/`}
      className="glass rounded-2xl p-4 md:p-6 block relative overflow-hidden hover:ring-1 transition group"
      style={{ boxShadow: `inset 0 0 32px ${color}11` }}
    >
      <div className={`absolute -top-4 ${align === 'left' ? '-right-4' : '-left-4'} opacity-[0.12] font-display font-black text-[140px] md:text-[200px] leading-none select-none pointer-events-none`}
        style={{ color }}
      >
        {ranking.tier}
      </div>
      <div className={`relative flex flex-col ${align === 'left' ? 'items-start' : 'items-end text-right'} gap-3`}>
        <img
          src={member.avatarUrl}
          alt={member.login}
          className="h-20 w-20 md:h-24 md:w-24 rounded-full ring-2 group-hover:scale-105 transition-transform"
          style={{ borderColor: color, boxShadow: `0 0 24px ${color}66` }}
        />
        <div className={`min-w-0 ${align === 'right' ? 'text-right' : ''} w-full`}>
          <div className="font-display font-bold text-lg md:text-2xl truncate" style={{ color }}>
            {member.name ?? member.login}
          </div>
          <div className="text-[10px] md:text-xs font-mono text-zinc-500 truncate">@{member.login}</div>
        </div>
        <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
          <RankBadge tier={ranking.tier} size="sm" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">#{ranking.rankNumber}</span>
        </div>
      </div>
    </Link>
  );
}

function buildOrgMax(stats: StatsFile | null): Breakdown | undefined {
  if (!stats) return;
  const max: Breakdown = { prsMerged: 0, prsOpened: 0, reviews: 0, issuesClosed: 0, issuesOpened: 0, commits: 0, comments: 0 };
  for (const r of stats.rankings) {
    if (r.breakdown.prsMerged    > max.prsMerged)    max.prsMerged = r.breakdown.prsMerged;
    if (r.breakdown.prsOpened    > max.prsOpened)    max.prsOpened = r.breakdown.prsOpened;
    if (r.breakdown.reviews      > max.reviews)      max.reviews = r.breakdown.reviews;
    if (r.breakdown.issuesClosed > max.issuesClosed) max.issuesClosed = r.breakdown.issuesClosed;
    if (r.breakdown.issuesOpened > max.issuesOpened) max.issuesOpened = r.breakdown.issuesOpened;
    if (r.breakdown.commits      > max.commits)      max.commits = r.breakdown.commits;
    if (r.breakdown.comments     > max.comments)     max.comments = r.breakdown.comments;
  }
  // Use a hint from TIER_HEX to keep imports used at runtime (TS doesn't drop them).
  void TIER_HEX;
  return max;
}
