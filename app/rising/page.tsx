'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { loadMembers, loadStats } from '@/lib/loadData';
import type { MembersFile, StatsFile, RankingEntry } from '@/lib/types';
import { useT } from '@/components/I18nProvider';

const TIER_HEX: Record<RankingEntry['tier'], string> = {
  S: '#fbbf24',
  A: '#a855f7',
  B: '#22d3ee',
  C: '#7dd3fc',
  D: '#94a3b8',
  E: '#71717a',
};

export default function RisingPage() {
  const t = useT();
  const [members, setMembers] = useState<MembersFile | null>(null);
  const [allTime, setAllTime] = useState<StatsFile | null>(null);
  const [weekly, setWeekly] = useState<StatsFile | null>(null);

  useEffect(() => { loadMembers().then(setMembers); }, []);
  useEffect(() => {
    loadStats('all').then(setAllTime);
    loadStats('weekly').then(setWeekly);
  }, []);

  const onFire = useMemo(() => {
    if (!allTime) return [];
    return allTime.rankings
      .filter((r) => (r.currentStreak ?? 0) >= 2)
      .sort((a, b) => (b.currentStreak ?? 0) - (a.currentStreak ?? 0))
      .slice(0, 10);
  }, [allTime]);

  const rising = useMemo(() => {
    if (!allTime || !weekly) return [];
    const allMap = new Map(allTime.rankings.map((r) => [r.login, r]));
    return weekly.rankings
      .map((w) => {
        const all = allMap.get(w.login);
        if (!all || all.xp < 100) return null;
        if (w.xp < 30) return null;
        const typical = all.xp / 52;
        if (typical <= 0) return null;
        const multiplier = w.xp / typical;
        if (multiplier < 1.5) return null;
        return { login: w.login, weeklyXp: w.xp, multiplier, tier: w.tier };
      })
      .filter((x): x is { login: string; weeklyXp: number; multiplier: number; tier: RankingEntry['tier'] } => !!x)
      .sort((a, b) => b.multiplier - a.multiplier)
      .slice(0, 10);
  }, [allTime, weekly]);

  if (!members || !allTime || !weekly) {
    return (
      <div className="text-center py-24">
        <div className="font-display tracking-[0.3em] text-zinc-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  const memberByLogin = new Map(members.members.map((m) => [m.login, m]));

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
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-400/40 to-transparent" />
          <span className="text-3xl drop-shadow-[0_0_14px_rgba(251,146,60,0.8)] shrink-0">🔥</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-neon-cyan/40 to-transparent" />
        </div>
        <h1 className="font-display font-black text-4xl md:text-6xl uppercase tracking-[0.08em] text-center leading-none">
          <span className="text-white">{t('rising.title.1')}</span>{' '}
          <span className="holo-text">{t('rising.title.2')}</span>
        </h1>
        <p className="text-center font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-zinc-500">
          {t('rising.subtitle')}
        </p>
      </div>

      {/* SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Section
          title={t('rising.onFire.title')}
          subtitle={t('rising.onFire.subtitle')}
          accent="#fb923c"
          icon="🔥"
        >
          {onFire.length === 0 ? (
            <EmptyHint text={t('rising.empty')} />
          ) : (
            onFire.map((r, idx) => {
              const m = memberByLogin.get(r.login);
              if (!m) return null;
              return (
                <Row
                  key={r.login}
                  idx={idx}
                  member={m}
                  tier={r.tier}
                  primary={`${r.currentStreak} ${t('rising.streak.suffix')}`}
                  secondary={r.longestStreak ? `${t('rising.streak.peak')} ${r.longestStreak}d` : ' '}
                  accentColor="#fb923c"
                />
              );
            })
          )}
        </Section>

        <Section
          title={t('rising.rising.title')}
          subtitle={t('rising.rising.subtitle')}
          accent="#22d3ee"
          icon="⚡"
        >
          {rising.length === 0 ? (
            <EmptyHint text={t('rising.empty')} />
          ) : (
            rising.map((r, idx) => {
              const m = memberByLogin.get(r.login);
              if (!m) return null;
              return (
                <Row
                  key={r.login}
                  idx={idx}
                  member={m}
                  tier={r.tier}
                  primary={`${r.multiplier.toFixed(1)}×`}
                  secondary={`${Math.round(r.weeklyXp).toLocaleString()} XP this week`}
                  accentColor="#22d3ee"
                />
              );
            })
          )}
        </Section>
      </div>
    </motion.div>
  );
}

function Section({
  title, subtitle, accent, icon, children,
}: {
  title: string;
  subtitle: string;
  accent: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="glass rounded-2xl p-5 md:p-6 relative overflow-hidden"
      style={{ boxShadow: `inset 0 0 48px ${accent}11` }}
    >
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none opacity-15"
        style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }}
      />
      <div className="flex items-center gap-3 mb-5 relative">
        <span className="text-3xl drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">{icon}</span>
        <div>
          <h2 className="font-display uppercase tracking-[0.25em] text-base font-bold" style={{ color: accent }}>{title}</h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-1 relative">{children}</div>
    </div>
  );
}

function Row({
  idx, member, tier, primary, secondary, accentColor,
}: {
  idx: number;
  member: { login: string; name: string | null; avatarUrl: string };
  tier: RankingEntry['tier'];
  primary: string;
  secondary: string;
  accentColor: string;
}) {
  const isTop = idx === 0;
  return (
    <Link
      href={`/hunter/${member.login}/`}
      className={`flex items-center gap-3 p-2.5 rounded-xl hover:bg-neon-purple/5 transition group ${isTop ? 'ring-1' : ''}`}
      style={isTop ? { borderColor: accentColor, boxShadow: `inset 0 0 24px ${accentColor}11` } : undefined}
    >
      <span
        className={`font-mono w-6 text-right ${isTop ? 'font-bold' : 'text-zinc-500'}`}
        style={isTop ? { color: accentColor } : undefined}
      >
        {idx + 1}
      </span>
      <img
        src={member.avatarUrl}
        alt={member.login}
        className="h-10 w-10 rounded-full ring-1 group-hover:scale-105 transition-transform"
        style={{ borderColor: TIER_HEX[tier], boxShadow: `0 0 14px ${TIER_HEX[tier]}55` }}
      />
      <div className="flex-1 min-w-0">
        <div className="font-display text-sm truncate">{member.name ?? member.login}</div>
        <div className="text-[10px] font-mono text-zinc-500 truncate">{secondary}</div>
      </div>
      <div className="font-mono font-bold text-base md:text-lg whitespace-nowrap" style={{ color: TIER_HEX[tier] }}>
        {primary}
      </div>
    </Link>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="py-10 text-center">
      <svg width="36" height="36" viewBox="0 0 36 36" className="text-zinc-600 mx-auto mb-2 opacity-50">
        <circle cx="18" cy="18" r="12" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2 4" />
      </svg>
      <p className="font-mono text-xs text-zinc-500 px-4">{text}</p>
    </div>
  );
}
