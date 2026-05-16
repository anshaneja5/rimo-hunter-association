'use client';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { MemberProfile, RankingEntry } from '@/lib/types';
import { RankBadge } from './RankBadge';
import { XPBar } from './XPBar';
import { BadgeChip } from './BadgeChip';
import { useT } from './I18nProvider';

const TIER_RING: Record<RankingEntry['tier'], string> = {
  S: 'ring-rank-s shadow-glow-s',
  A: 'ring-rank-a shadow-glow-a',
  B: 'ring-rank-b shadow-glow-b',
  C: 'ring-rank-c shadow-glow-c',
  D: 'ring-rank-d shadow-glow-d',
  E: 'ring-rank-e shadow-glow-e',
};

const TIER_ROTATING_RING: Record<RankingEntry['tier'], string> = {
  S: 'tier-ring',
  A: 'tier-ring tier-a',
  B: 'tier-ring tier-b',
  C: '',
  D: '',
  E: '',
};

const TIER_BG_TINT: Record<RankingEntry['tier'], string> = {
  S: 'from-rank-s/10',
  A: 'from-rank-a/10',
  B: 'from-rank-b/10',
  C: 'from-transparent',
  D: 'from-transparent',
  E: 'from-transparent',
};

export function HunterCard({ member, ranking, maxXp, size = 'md' }: {
  member: MemberProfile;
  ranking: RankingEntry;
  maxXp: number;
  size?: 'md' | 'lg';
}) {
  const t = useT();
  const avatarSize = size === 'lg' ? 'h-32 w-32' : 'h-20 w-20';

  // 3D tilt on hover
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-50, 50], [6, -6]), { stiffness: 200, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-50, 50], [-6, 6]), { stiffness: 200, damping: 18 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }
  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const isTopTier = ranking.tier === 'S' || ranking.tier === 'A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group glass rounded-2xl p-6 relative overflow-hidden tilt-hover"
    >
      {/* Tier-tinted radial wash on the card */}
      <div className={`absolute inset-0 bg-gradient-to-br ${TIER_BG_TINT[ranking.tier]} via-transparent to-transparent pointer-events-none`} />

      {/* Massive tier letter watermark */}
      <div className="absolute -top-4 -right-4 opacity-[0.12] font-display font-black text-[200px] leading-none text-white select-none pointer-events-none">
        {ranking.tier}
      </div>

      {/* Rank number stamp — top-left */}
      <div className="absolute top-4 left-4 font-mono text-[10px] text-zinc-500 tracking-widest">
        #{String(ranking.rankNumber).padStart(3, '0')}
      </div>

      <div className="flex items-start gap-5 relative pt-4">
        <Link href={`/hunter/${member.login}/`} className="shrink-0">
          <div className={`relative ${isTopTier ? TIER_ROTATING_RING[ranking.tier] : ''}`}>
            <img
              src={member.avatarUrl}
              alt={member.login}
              className={`${avatarSize} rounded-full ring-2 ${TIER_RING[ranking.tier]} relative z-10 group-hover:scale-105 transition-transform duration-300`}
            />
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <Link href={`/hunter/${member.login}/`}>
              <h3 className="font-display text-2xl font-bold tracking-wide hover:text-neon-purple transition-colors truncate">
                {member.name ?? member.login}
              </h3>
            </Link>
            <RankBadge tier={ranking.tier} size="sm" />
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3 font-display">
            {t(`tier.${ranking.tier}` as const)}
          </div>
          <XPBar xp={ranking.xp} max={maxXp} tier={ranking.tier} />
          {ranking.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {ranking.badges.map((b) => <BadgeChip key={b} id={b} size="sm" />)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
