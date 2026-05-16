'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { MemberProfile, RankingEntry } from '@/lib/types';
import { RankBadge } from './RankBadge';
import { XPBar } from './XPBar';
import { BadgeChip } from './BadgeChip';
import { useT } from './I18nProvider';

interface Row {
  member: MemberProfile;
  ranking: RankingEntry;
}

export function LeaderboardTable({ rows, maxXp }: { rows: Row[]; maxXp: number }) {
  const t = useT();
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead className="text-xs uppercase tracking-widest text-zinc-500 border-b border-neon-purple/10">
          <tr>
            <th className="text-left px-4 py-3 w-12">{t('leaderboard.col.rank')}</th>
            <th className="text-left px-4 py-3">{t('leaderboard.col.hunter')}</th>
            <th className="text-left px-4 py-3 w-24">{t('leaderboard.col.tier')}</th>
            <th className="text-left px-4 py-3 w-64">{t('leaderboard.col.xp')}</th>
            <th className="text-left px-4 py-3 hidden md:table-cell">{t('leaderboard.col.activity')}</th>
            <th className="text-left px-4 py-3 hidden lg:table-cell">{t('leaderboard.col.badges')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <motion.tr
              key={r.member.login}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.02, 0.4) }}
              className="border-b border-neon-purple/5 hover:bg-neon-purple/5 transition-colors"
            >
              <td className="px-4 py-3 font-display text-zinc-500">#{r.ranking.rankNumber}</td>
              <td className="px-4 py-3">
                <Link href={`/hunter/${r.member.login}/`} className="flex items-center gap-3 group">
                  <img src={r.member.avatarUrl} alt={r.member.login} className="h-8 w-8 rounded-full ring-1 ring-neon-purple/40" />
                  <span className="font-display tracking-wide group-hover:text-neon-purple transition-colors">
                    {r.member.name ?? r.member.login}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3"><RankBadge tier={r.ranking.tier} size="sm" /></td>
              <td className="px-4 py-3"><XPBar xp={r.ranking.xp} max={maxXp} tier={r.ranking.tier} /></td>
              <td className="px-4 py-3 hidden md:table-cell">
                <Sparkline data={r.ranking.sparkline} />
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <div className="flex flex-wrap gap-1">
                  {r.ranking.badges.slice(0, 3).map((b) => <BadgeChip key={b} id={b} size="sm" />)}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length === 0) return null;
  const max = Math.max(1, ...data);
  const w = 80, h = 24;
  const step = w / Math.max(1, data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="text-neon-cyan">
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points} />
    </svg>
  );
}
