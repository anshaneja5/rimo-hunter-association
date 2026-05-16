'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadMembers, loadStats, findMember } from '@/lib/loadData';
import type { MembersFile, StatsFile, Period } from '@/lib/types';
import { PeriodToggle } from '@/components/PeriodToggle';
import { MVPSpotlight } from '@/components/MVPSpotlight';
import { HunterCard } from '@/components/HunterCard';

export default function Home() {
  const [period, setPeriod] = useState<Period>('weekly');
  const [members, setMembers] = useState<MembersFile | null>(null);
  const [stats, setStats] = useState<StatsFile | null>(null);

  useEffect(() => { loadMembers().then(setMembers); }, []);
  useEffect(() => { loadStats(period).then(setStats); }, [period]);

  if (!members || !stats) {
    return <div className="text-center py-24 font-display tracking-widest text-zinc-500">Summoning hunters...</div>;
  }

  const mvp = stats.rankings[0];
  const mvpMember = mvp ? findMember(members.members, mvp.login) : undefined;
  const top10 = stats.rankings.slice(0, 10);
  const maxXp = stats.rankings[0]?.xp ?? 1;

  return (
    <div className="space-y-12">
      <section className="text-center pt-8">
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-[0.1em] mb-3">
          <span className="text-white">RIMO</span>{' '}
          <span className="text-neon-purple drop-shadow-glow-a">HUNTER</span>{' '}
          <span className="text-neon-cyan drop-shadow-glow-b">ASSOCIATION</span>
        </h1>
        <p className="text-zinc-400 tracking-widest text-sm uppercase">
          The official ranking of Rimo's GitHub hunters · updated hourly
        </p>
      </section>

      <section className="flex justify-center">
        <PeriodToggle value={period} onChange={setPeriod} />
      </section>

      {mvp && mvpMember && (
        <section>
          <MVPSpotlight member={mvpMember} ranking={mvp} label={`#1 · ${labelForPeriod(period)}`} />
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl uppercase tracking-widest">Top 10</h2>
          <Link href="/leaderboard/" className="text-sm font-display uppercase tracking-widest text-neon-cyan hover:text-neon-purple">
            View full ladder →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {top10.map((r) => {
            const m = findMember(members.members, r.login);
            if (!m) return null;
            return <HunterCard key={r.login} member={m} ranking={r} maxXp={maxXp} />;
          })}
        </div>
      </section>
    </div>
  );
}

function labelForPeriod(p: Period): string {
  return p === 'daily' ? 'Today' : p === 'weekly' ? 'This week' : p === 'monthly' ? 'This month' : 'All-time';
}
