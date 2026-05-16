'use client';
import { motion } from 'framer-motion';
import type { MemberProfile, RankingEntry } from '@/lib/types';
import { RankBadge } from './RankBadge';
import { MagicCircle } from './MagicCircle';
import { useT } from './I18nProvider';

const TIER_BORDER: Record<RankingEntry['tier'], string> = {
  S: 'ring-rank-s',
  A: 'ring-rank-a',
  B: 'ring-rank-b',
  C: 'ring-rank-c',
  D: 'ring-rank-d',
  E: 'ring-rank-e',
};
const TIER_SHADOW: Record<RankingEntry['tier'], string> = {
  S: 'shadow-glow-s',
  A: 'shadow-glow-a',
  B: 'shadow-glow-b',
  C: 'shadow-glow-c',
  D: 'shadow-glow-d',
  E: 'shadow-glow-e',
};
const TIER_TINT: Record<RankingEntry['tier'], string> = {
  S: 'from-rank-s/20',
  A: 'from-rank-a/20',
  B: 'from-rank-b/20',
  C: 'from-rank-c/20',
  D: 'from-rank-d/15',
  E: 'from-rank-e/15',
};

export function MVPSpotlight({ member, ranking, label }: {
  member: MemberProfile;
  ranking: RankingEntry;
  label: string;
}) {
  const t = useT();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative glass glass-strong rounded-2xl md:rounded-3xl p-6 md:p-14 overflow-hidden corner-brackets scan-sweep"
    >
      <span className="bracket-bl" />
      <span className="bracket-br" />

      {/* Tier-tinted radial wash */}
      <div className={`absolute inset-0 bg-gradient-to-br ${TIER_TINT[ranking.tier]} via-transparent to-neon-cyan/10 pointer-events-none`} />

      {/* Diagonal striped overlay for that mecha-cockpit vibe */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 12px, rgba(255,255,255,0.6) 12px 13px)',
        }} />

      {/* Massive tier letter watermark */}
      <div className="absolute -top-12 -right-6 font-display text-[300px] leading-none opacity-[0.07] select-none pointer-events-none">
        {ranking.tier}
      </div>

      {/* MVP crown badge — top-left */}
      <div className="absolute top-5 left-6 flex items-center gap-2 font-display text-xs uppercase tracking-[0.35em] text-neon-cyan/80">
        <span className="text-rank-s text-base">♛</span>
        <span>MVP</span>
      </div>

      <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 pt-8">
        {/* Avatar wrapped in rotating magic circle */}
        <div className="relative flex-shrink-0">
          <MagicCircle
            size={280}
            className="absolute -inset-8 md:-inset-12 opacity-70 hidden sm:block"
            color={ranking.tier === 'S' ? '#fbbf24' : '#a855f7'}
            accentColor="#22d3ee"
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <img
              src={member.avatarUrl}
              alt={member.login}
              className={`relative h-32 w-32 md:h-44 md:w-44 lg:h-52 lg:w-52 rounded-full ring-4 ${TIER_BORDER[ranking.tier]} ${TIER_SHADOW[ranking.tier]}`}
            />
            {/* Holographic sheen overlay */}
            <div className="absolute inset-0 rounded-full pointer-events-none mix-blend-overlay opacity-40"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 35%, transparent 65%, rgba(34,211,238,0.3) 100%)',
              }} />
          </motion.div>
        </div>

        <div className="relative flex-1 text-center md:text-left min-w-0 w-full">
          <div className="text-[10px] md:text-xs uppercase tracking-[0.35em] text-neon-cyan mb-3 font-mono">{label}</div>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-6xl lg:text-7xl mb-2 leading-none holo-text break-words">
            {member.name ?? member.login}
          </h2>
          <div className="text-zinc-400 mb-5 font-mono text-xs md:text-sm truncate">@{member.login}</div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
            <RankBadge tier={ranking.tier} size="lg" showLabel />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 text-sm">
            <Stat label={t('stat.prsMerged')} value={ranking.breakdown.prsMerged} accent="text-rank-s" />
            <Stat label={t('stat.commits')} value={ranking.breakdown.commits} accent="text-neon-purple" />
            <Stat label={t('stat.reviews')} value={ranking.breakdown.reviews} accent="text-neon-cyan" />
            <Stat label={t('stat.xp')} value={Math.round(ranking.xp)} accent="text-white" highlight />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, accent, highlight }: { label: string; value: number; accent: string; highlight?: boolean }) {
  return (
    <div className={`glass rounded-xl px-3 py-3 text-center md:text-left ${highlight ? 'ring-1 ring-neon-purple/50' : ''}`}>
      <div className={`font-mono font-bold text-2xl md:text-3xl ${accent} leading-none`}>
        {value.toLocaleString()}
      </div>
      <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mt-2 font-display">{label}</div>
    </div>
  );
}
