'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { loadMembers, loadStats, findMember } from '@/lib/loadData';
import type { MembersFile, StatsFile, Period } from '@/lib/types';
import { PeriodToggle } from '@/components/PeriodToggle';
import { MVPSpotlight } from '@/components/MVPSpotlight';
import { HunterCard } from '@/components/HunterCard';
import { CursorGlow } from '@/components/CursorGlow';
import { useT } from '@/components/I18nProvider';

export default function Home() {
  const t = useT();
  const [period, setPeriod] = useState<Period>('weekly');
  const [members, setMembers] = useState<MembersFile | null>(null);
  const [stats, setStats] = useState<StatsFile | null>(null);

  useEffect(() => { loadMembers().then(setMembers); }, []);
  useEffect(() => { loadStats(period).then(setStats); }, [period]);

  if (!members || !stats) {
    return (
      <div className="text-center py-24">
        <div className="font-display tracking-[0.3em] text-zinc-500 animate-pulse">{t('landing.loading')}</div>
      </div>
    );
  }

  const mvp = stats.rankings[0];
  const mvpMember = mvp ? findMember(members.members, mvp.login) : undefined;
  const top10 = stats.rankings.slice(0, 10);
  const maxXp = stats.rankings[0]?.xp ?? 1;
  const totalHunters = stats.rankings.length;

  const periodLabel = period === 'daily' ? t('periodLabel.today')
    : period === 'weekly' ? t('periodLabel.thisWeek')
    : period === 'monthly' ? t('periodLabel.thisMonth')
    : t('periodLabel.allTime');

  return (
    <>
      <CursorGlow />
      <div className="space-y-14">

        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center pt-6 relative"
        >
          {/* kanji vertical accent floating top-right */}
          <div className="absolute right-2 top-0 font-jp text-[10px] text-neon-cyan/30 tracking-[0.6em] writing-mode-vertical hidden md:block"
            style={{ writingMode: 'vertical-rl' as never }}>
            狩 人 協 会 · 二 〇 二 六
          </div>

          {/* Decorative divider with crossed katanas */}
          <div className="flex items-center justify-center gap-4 mb-6 opacity-70">
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-neon-purple" />
            <svg width="40" height="40" viewBox="0 0 40 40" className="text-neon-purple">
              <g stroke="currentColor" strokeWidth="1.2" fill="none">
                <line x1="6" y1="6" x2="34" y2="34" />
                <line x1="34" y1="6" x2="6" y2="34" />
                <circle cx="20" cy="20" r="4" />
                <circle cx="20" cy="20" r="9" opacity="0.4" />
              </g>
            </svg>
            <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-neon-cyan" />
          </div>

          <h1 className="font-display font-black text-6xl md:text-8xl tracking-[0.08em] mb-4 leading-[0.95]">
            <span className="block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">{t('landing.heading.1')}</span>
            <span className="block holo-text text-7xl md:text-9xl my-1">{t('landing.heading.2')}</span>
            <span className="block text-neon-cyan drop-shadow-glow-b">{t('landing.heading.3')}</span>
          </h1>
          <p className="text-zinc-400 tracking-[0.3em] text-xs md:text-sm uppercase font-mono max-w-2xl mx-auto">
            {t('landing.subtitle')}
          </p>

          {/* Live stats strip */}
          <div className="mt-8 flex items-center justify-center gap-6 md:gap-10 text-zinc-500 font-mono text-xs uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
              <span>Live</span>
            </div>
            <div><span className="text-white font-bold">{totalHunters}</span> Hunters</div>
            <div className="hidden md:block"><span className="text-rank-s font-bold">S</span> · <span className="text-rank-a font-bold">A</span> · <span className="text-rank-b font-bold">B</span> · <span className="text-rank-c font-bold">C</span> · <span className="text-rank-d font-bold">D</span> · <span className="text-rank-e font-bold">E</span></div>
          </div>
        </motion.section>

        {/* PERIOD TOGGLE */}
        <section className="flex justify-center">
          <PeriodToggle value={period} onChange={setPeriod} />
        </section>

        {/* MVP */}
        {mvp && mvpMember && (
          <section>
            <MVPSpotlight member={mvpMember} ranking={mvp} label={`#1 · ${periodLabel}`} />
          </section>
        )}

        {/* TOP 10 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl uppercase tracking-[0.2em]">{t('landing.top10')}</span>
              <span className="h-px flex-1 bg-gradient-to-r from-neon-purple/40 to-transparent w-24" />
            </div>
            <Link href="/leaderboard/" className="text-xs font-display uppercase tracking-[0.3em] text-neon-cyan hover:text-neon-purple transition-colors">
              {t('landing.viewLadder')}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {top10.map((r, idx) => {
              const m = findMember(members.members, r.login);
              if (!m) return null;
              return (
                <motion.div
                  key={r.login}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + idx * 0.04, duration: 0.4 }}
                >
                  <HunterCard member={m} ranking={r} maxXp={maxXp} />
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
