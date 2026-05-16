'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { MemberProfile, RankingEntry } from '@/lib/types';
import { RankBadge, TIER_LABEL } from './RankBadge';
import { XPBar } from './XPBar';
import { BadgeChip } from './BadgeChip';

const TIER_RING: Record<RankingEntry['tier'], string> = {
  S: 'ring-rank-s shadow-glow-s',
  A: 'ring-rank-a shadow-glow-a',
  B: 'ring-rank-b shadow-glow-b',
  C: 'ring-rank-c shadow-glow-c',
  D: 'ring-rank-d shadow-glow-d',
  E: 'ring-rank-e shadow-glow-e',
};

export function HunterCard({ member, ranking, maxXp, size = 'md' }: {
  member: MemberProfile;
  ranking: RankingEntry;
  maxXp: number;
  size?: 'md' | 'lg';
}) {
  const avatarSize = size === 'lg' ? 'h-32 w-32' : 'h-20 w-20';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-6 relative overflow-hidden"
    >
      <div className="absolute -top-4 -right-4 opacity-20 font-display text-[180px] leading-none text-neon-purple select-none">
        {ranking.tier}
      </div>
      <div className="flex items-start gap-5 relative">
        <Link href={`/hunter/${member.login}/`} className="shrink-0">
          <img
            src={member.avatarUrl}
            alt={member.login}
            className={`${avatarSize} rounded-full ring-2 ${TIER_RING[ranking.tier]}`}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <Link href={`/hunter/${member.login}/`}>
              <h3 className="font-display text-2xl font-bold tracking-wide hover:text-neon-purple transition-colors">
                {member.name ?? member.login}
              </h3>
            </Link>
            <RankBadge tier={ranking.tier} size="sm" />
          </div>
          <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
            #{ranking.rankNumber} · {TIER_LABEL[ranking.tier]}
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
