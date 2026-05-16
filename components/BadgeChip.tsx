'use client';
import type { BadgeId } from '@/lib/types';
import { useT } from './I18nProvider';

const BADGE_EMOJI: Record<BadgeId, string> = {
  'first-blood':     '🩸',
  'bug-slayer':      '🐛',
  'code-monk':       '🧘',
  'reviewer-sensei': '🥋',
  'streak-lord':     '🔥',
  'ghost':           '👻',
  'awakening':       '⚡',
};

export function BadgeChip({ id, size = 'md' }: { id: BadgeId; size?: 'sm' | 'md' }) {
  const t = useT();
  const sizes = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';
  return (
    <span
      title={t(`badge.${id}.desc` as const)}
      className={`inline-flex items-center gap-1 rounded-full glass border border-neon-purple/30 ${sizes}`}
    >
      <span>{BADGE_EMOJI[id]}</span>
      <span className="font-display tracking-wider uppercase">{t(`badge.${id}.label` as const)}</span>
    </span>
  );
}
