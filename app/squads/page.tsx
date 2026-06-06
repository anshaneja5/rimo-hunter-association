'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { loadSquads, loadMembers } from '@/lib/loadData';
import type { SquadsFile, MembersFile, Squad } from '@/lib/types';
import { useT } from '@/components/I18nProvider';

export default function SquadsPage() {
  const t = useT();
  const [squads, setSquads] = useState<SquadsFile | null>(null);
  const [members, setMembers] = useState<MembersFile | null>(null);

  useEffect(() => { loadSquads().then(setSquads).catch(() => setSquads(null)); }, []);
  useEffect(() => { loadMembers().then(setMembers); }, []);

  if (!squads || !members) {
    return (
      <div className="text-center py-24">
        <div className="font-display tracking-[0.3em] text-zinc-500 animate-pulse">{t('squads.loading')}</div>
      </div>
    );
  }

  const sorted = [...squads.squads].sort((a, b) => a.rank - b.rank);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 md:space-y-12"
    >
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-3 md:gap-4">
          <div className="h-px w-12 md:w-24 bg-gradient-to-r from-transparent to-neon-purple/40" />
          <svg width="32" height="32" viewBox="0 0 32 32" className="text-neon-purple drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
            <path d="M16 4 L22 12 L28 8 L24 20 L8 20 L4 8 L10 12 Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" />
            <rect x="10" y="20" width="12" height="3" rx="1" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.2" />
            <line x1="16" y1="23" x2="16" y2="28" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="12" y1="28" x2="20" y2="28" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <div className="h-px w-12 md:w-24 bg-gradient-to-l from-transparent to-neon-cyan/40" />
        </div>
        <h1 className="font-display font-black text-4xl md:text-6xl uppercase tracking-[0.08em] leading-none">
          <span className="text-white">{t('squads.title.1')}</span>{' '}
          <span className="holo-text">{t('squads.title.2')}</span>
        </h1>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
          {t('squads.weekLabel')} {squads.isoWeek}
        </p>
      </div>

      {/* Squad cards */}
      <div className="space-y-4 md:space-y-6">
        {sorted.map((squad, i) => (
          <SquadCard key={squad.index} squad={squad} members={members} delay={i * 0.06} />
        ))}
      </div>
    </motion.div>
  );
}

function SquadCard({
  squad,
  members,
  delay,
}: {
  squad: Squad;
  members: MembersFile;
  delay: number;
}) {
  const t = useT();
  const isFirst = squad.rank === 1;
  const rankColor = isFirst
    ? 'text-rank-s'
    : squad.rank === 2
    ? 'text-neon-purple'
    : 'text-neon-cyan';
  const ringColor = isFirst
    ? 'ring-rank-s/30'
    : squad.rank === 2
    ? 'ring-neon-purple/20'
    : 'ring-neon-cyan/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`glass rounded-2xl p-5 md:p-6 ring-1 ${ringColor} relative overflow-hidden`}
    >
      {isFirst && (
        <div className="absolute -top-8 -right-8 font-display font-black text-[120px] leading-none opacity-[0.05] select-none pointer-events-none text-rank-s">
          #1
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Rank + name */}
        <div className="flex items-center gap-4 min-w-0">
          <div className={`font-display font-black text-4xl md:text-5xl leading-none shrink-0 ${rankColor}`}>
            #{squad.rank}
          </div>
          <div className="min-w-0">
            <div className={`font-display text-lg md:text-2xl uppercase tracking-[0.12em] leading-tight truncate ${isFirst ? 'holo-text' : 'text-white'}`}>
              {squad.name}
            </div>
            <div className="text-zinc-400 font-mono text-xs mt-0.5">
              {Math.round(squad.totalXp).toLocaleString()} {t('squads.totalXp')}
            </div>
          </div>
        </div>

        {/* Member avatars strip */}
        <div className="flex items-center gap-1.5 sm:ml-auto flex-wrap">
          {squad.members.map((m) => {
            const member = members.members.find((mem) => mem.login === m.login);
            if (!member) return null;
            return (
              <Link key={m.login} href={`/hunter/${m.login}/`} title={member.name ?? m.login}>
                <img
                  src={member.avatarUrl}
                  alt={m.login}
                  className="h-8 w-8 rounded-full ring-1 ring-white/10 hover:ring-neon-purple/60 transition-all"
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Member breakdown */}
      <div className="mt-4 divide-y divide-white/5">
        {[...squad.members]
          .sort((a, b) => b.weeklyXp - a.weeklyXp)
          .map((m, idx) => {
            const member = members.members.find((mem) => mem.login === m.login);
            return (
              <div key={m.login} className="flex items-center gap-3 py-2">
                <span className="text-zinc-600 font-mono text-[10px] w-4 shrink-0">{idx + 1}</span>
                {member && (
                  <img src={member.avatarUrl} alt={m.login} className="h-6 w-6 rounded-full shrink-0" />
                )}
                <Link
                  href={`/hunter/${m.login}/`}
                  className="flex-1 text-sm font-display truncate hover:text-neon-cyan transition-colors"
                >
                  {member?.name ?? m.login}
                </Link>
                <span className="font-mono text-xs text-zinc-400 shrink-0">
                  {Math.round(m.weeklyXp).toLocaleString()} {t('squads.member.xp')}
                </span>
              </div>
            );
          })}
      </div>
    </motion.div>
  );
}
