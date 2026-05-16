'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadMembers, loadStats, findMember } from '@/lib/loadData';
import type { MembersFile, StatsFile, Period } from '@/lib/types';
import { PeriodToggle } from '@/components/PeriodToggle';
import { MVPSpotlight } from '@/components/MVPSpotlight';
import { HunterCard } from '@/components/HunterCard';
import { useT } from '@/components/I18nProvider';

export default function Home() {
  const t = useT();
  const [period, setPeriod] = useState<Period>('weekly');
  const [members, setMembers] = useState<MembersFile | null>(null);
  const [stats, setStats] = useState<StatsFile | null>(null);

  useEffect(() => { loadMembers().then(setMembers); }, []);
  useEffect(() => { loadStats(period).then(setStats); }, [period]);

  if (!members || !stats) {
    return <div className="text-center py-24 font-display tracking-widest text-zinc-500">{t('landing.loading')}</div>;
  }

  const mvp = stats.rankings[0];
  const mvpMember = mvp ? findMember(members.members, mvp.login) : undefined;
  const top10 = stats.rankings.slice(0, 10);
  const maxXp = stats.rankings[0]?.xp ?? 1;

  const periodLabel = period === 'daily' ? t('periodLabel.today')
    : period === 'weekly' ? t('periodLabel.thisWeek')
    : period === 'monthly' ? t('periodLabel.thisMonth')
    : t('periodLabel.allTime');

  return (
    <div className="space-y-12">
      <section className="text-center pt-8">
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-[0.1em] mb-3">
          <span className="text-white">{t('landing.heading.1')}</span>{' '}
          <span className="text-neon-purple drop-shadow-glow-a">{t('landing.heading.2')}</span>{' '}
          <span className="text-neon-cyan drop-shadow-glow-b">{t('landing.heading.3')}</span>
        </h1>
        <p className="text-zinc-400 tracking-widest text-sm uppercase">
          {t('landing.subtitle')}
        </p>
      </section>

      <section className="flex justify-center">
        <PeriodToggle value={period} onChange={setPeriod} />
      </section>

      {mvp && mvpMember && (
        <section>
          <MVPSpotlight member={mvpMember} ranking={mvp} label={`${t('landing.mvpLabel.prefix')} ${periodLabel}`} />
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl uppercase tracking-widest">{t('landing.top10')}</h2>
          <Link href="/leaderboard/" className="text-sm font-display uppercase tracking-widest text-neon-cyan hover:text-neon-purple">
            {t('landing.viewLadder')}
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
