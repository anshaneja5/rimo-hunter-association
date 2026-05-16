'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
    return (
      <div className="text-center py-24">
        <div className="font-display tracking-[0.3em] text-zinc-500 animate-pulse">{t('legends.loading')}</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 md:space-y-12"
    >
      {/* Header with crown SVG */}
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-3 md:gap-4">
          <div className="h-px w-12 md:w-24 bg-gradient-to-r from-transparent to-rank-s/40" />
          <svg width="32" height="32" viewBox="0 0 32 32" className="text-rank-s drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
            <path d="M4 24 L8 12 L12 18 L16 8 L20 18 L24 12 L28 24 Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" />
            <rect x="4" y="24" width="24" height="3" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.2" />
          </svg>
          <div className="h-px w-12 md:w-24 bg-gradient-to-l from-transparent to-rank-s/40" />
        </div>

        <h1 className="font-display font-black text-4xl md:text-6xl uppercase tracking-[0.08em] leading-none">
          <span className="text-white">{t('legends.title.1')}</span>{' '}
          <span className="holo-text">{t('legends.title.2')}</span>
        </h1>
      </div>

      {/* Monthly MVPs */}
      <section>
        <h2 className="font-display uppercase tracking-[0.25em] text-xs md:text-sm text-zinc-400 mb-4 flex items-center gap-2">
          <span className="w-1 h-3 bg-rank-s rounded-full" />
          {t('legends.monthlyMvps')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {mvps.monthly.map((m, idx) => {
            const member = members.members.find((mem) => mem.login === m.login);
            if (!member) return null;
            return (
              <motion.div
                key={m.month}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.4 }}
              >
                <Link
                  href={`/hunter/${member.login}/`}
                  className="glass rounded-xl p-4 text-center hover:ring-1 hover:ring-rank-s/60 transition-all group block"
                >
                  <div className="relative inline-block mb-3">
                    <img
                      src={member.avatarUrl}
                      alt={member.login}
                      className="h-16 w-16 md:h-20 md:w-20 rounded-full ring-2 ring-rank-s shadow-glow-s group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute -top-1 -right-1 text-rank-s text-base drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">♛</span>
                  </div>
                  <div className="font-display text-sm md:text-lg truncate">{member.name ?? member.login}</div>
                  <div className="text-[10px] uppercase tracking-widest text-neon-cyan mt-1 font-mono">{m.month}</div>
                  <div className="text-[10px] text-zinc-500 mt-1 font-mono">{Math.round(m.xp).toLocaleString()} {t('stat.xp')}</div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Weekly MVPs */}
      <section>
        <h2 className="font-display uppercase tracking-[0.25em] text-xs md:text-sm text-zinc-400 mb-4 flex items-center gap-2">
          <span className="w-1 h-3 bg-rank-a rounded-full" />
          {t('legends.weeklyMvps')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3">
          {mvps.weekly.map((w, idx) => {
            const member = members.members.find((mem) => mem.login === w.login);
            if (!member) return null;
            return (
              <motion.div
                key={w.weekStart}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.3), duration: 0.4 }}
              >
                <Link
                  href={`/hunter/${member.login}/`}
                  className="glass rounded-lg p-3 text-center hover:ring-1 hover:ring-rank-a transition-all block"
                >
                  <img src={member.avatarUrl} alt={member.login} className="h-12 w-12 md:h-14 md:w-14 rounded-full mx-auto ring-1 ring-rank-a mb-2" />
                  <div className="text-[11px] md:text-xs font-display truncate">{member.name ?? member.login}</div>
                  <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 font-mono mt-1">
                    {t('legends.weekOf')} {w.weekStart?.slice(5, 10)}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
