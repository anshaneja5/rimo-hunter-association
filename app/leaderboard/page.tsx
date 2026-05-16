'use client';
import { useEffect, useState } from 'react';
import { loadMembers, loadStats, findMember } from '@/lib/loadData';
import type { MembersFile, StatsFile, Period } from '@/lib/types';
import { PeriodToggle } from '@/components/PeriodToggle';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { useT } from '@/components/I18nProvider';

export default function LeaderboardPage() {
  const t = useT();
  const [period, setPeriod] = useState<Period>('weekly');
  const [members, setMembers] = useState<MembersFile | null>(null);
  const [stats, setStats] = useState<StatsFile | null>(null);

  useEffect(() => { loadMembers().then(setMembers); }, []);
  useEffect(() => { loadStats(period).then(setStats); }, [period]);

  if (!members || !stats) {
    return <div className="text-center py-24 font-display tracking-widest text-zinc-500">{t('leaderboard.loading')}</div>;
  }

  const maxXp = stats.rankings[0]?.xp ?? 1;
  const rows = stats.rankings
    .map((r) => ({ member: findMember(members.members, r.login)!, ranking: r }))
    .filter((r) => r.member);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="font-display text-4xl uppercase tracking-[0.1em]">
          <span className="text-neon-purple">{t('leaderboard.title.1')}</span>{' '}
          {t('leaderboard.title.2')}
        </h1>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>
      <LeaderboardTable rows={rows} maxXp={maxXp} />
    </div>
  );
}
