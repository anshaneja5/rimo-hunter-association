'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadMembers, loadMvps } from '@/lib/loadData';
import type { MembersFile, MVPsFile } from '@/lib/types';
import { useT } from '@/components/I18nProvider';

export default function LegendsPage() {
  const t = useT();
  const [members, setMembers] = useState<MembersFile | null>(null);
  const [mvps, setMvps] = useState<MVPsFile | null>(null);

  useEffect(() => { loadMembers().then(setMembers); }, []);
  useEffect(() => { loadMvps().then(setMvps); }, []);

  if (!members || !mvps) {
    return <div className="text-center py-24 font-display tracking-widest text-zinc-500">{t('legends.loading')}</div>;
  }

  return (
    <div className="space-y-12">
      <h1 className="font-display text-4xl uppercase tracking-[0.1em] text-center">
        <span className="text-neon-purple">{t('legends.title.1')}</span>{' '}
        <span className="text-neon-cyan">{t('legends.title.2')}</span>
      </h1>

      <section>
        <h2 className="font-display uppercase tracking-widest text-sm text-zinc-400 mb-4">{t('legends.monthlyMvps')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {mvps.monthly.map((m) => {
            const member = members.members.find((mem) => mem.login === m.login);
            if (!member) return null;
            return (
              <Link
                href={`/hunter/${member.login}/`}
                key={m.month}
                className="glass rounded-xl p-4 text-center hover:ring-1 hover:ring-neon-purple transition-all group"
              >
                <img
                  src={member.avatarUrl}
                  alt={member.login}
                  className="h-20 w-20 rounded-full mx-auto ring-2 ring-rank-s shadow-glow-s mb-3 group-hover:scale-105 transition-transform"
                />
                <div className="font-display text-lg">{member.name ?? member.login}</div>
                <div className="text-xs uppercase tracking-widest text-neon-cyan mt-1">{m.month}</div>
                <div className="text-xs text-zinc-500 mt-1">{Math.round(m.xp)} {t('stat.xp')}</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display uppercase tracking-widest text-sm text-zinc-400 mb-4">{t('legends.weeklyMvps')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {mvps.weekly.map((w) => {
            const member = members.members.find((mem) => mem.login === w.login);
            if (!member) return null;
            return (
              <Link
                href={`/hunter/${member.login}/`}
                key={w.weekStart}
                className="glass rounded-lg p-3 text-center hover:ring-1 hover:ring-neon-purple transition-all"
              >
                <img src={member.avatarUrl} alt={member.login} className="h-14 w-14 rounded-full mx-auto ring-1 ring-rank-a mb-2" />
                <div className="text-xs font-display truncate">{member.name ?? member.login}</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  {t('legends.weekOf')} {w.weekStart?.slice(5, 10)}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
