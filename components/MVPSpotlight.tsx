'use client';
import { motion } from 'framer-motion';
import type { MemberProfile, RankingEntry } from '@/lib/types';
import { RankBadge } from './RankBadge';
import { useT } from './I18nProvider';

export function MVPSpotlight({ member, ranking, label }: {
  member: MemberProfile;
  ranking: RankingEntry;
  label: string;
}) {
  const t = useT();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative glass rounded-3xl p-8 md:p-12 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-transparent to-neon-cyan/20 pointer-events-none" />
      <div className="absolute -top-8 -right-8 font-display text-[280px] leading-none opacity-10 select-none">
        {ranking.tier}
      </div>
      <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
        <motion.img
          src={member.avatarUrl}
          alt={member.login}
          className="h-40 w-40 rounded-full ring-4 ring-neon-purple shadow-glow-a"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-neon-cyan mb-2">{label}</div>
          <h2 className="font-display text-5xl md:text-6xl font-bold mb-2">{member.name ?? member.login}</h2>
          <div className="text-zinc-400 mb-4">@{member.login}</div>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <RankBadge tier={ranking.tier} size="lg" showLabel />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Stat label={t('stat.prsMerged')} value={ranking.breakdown.prsMerged} />
            <Stat label={t('stat.commits')} value={ranking.breakdown.commits} />
            <Stat label={t('stat.reviews')} value={ranking.breakdown.reviews} />
            <Stat label={t('stat.xp')} value={Math.round(ranking.xp)} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-display text-3xl">{value}</div>
      <div className="text-xs uppercase tracking-widest text-zinc-500">{label}</div>
    </div>
  );
}
