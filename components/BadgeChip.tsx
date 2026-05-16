import type { BadgeId } from '@/lib/types';

const BADGE_META: Record<BadgeId, { emoji: string; label: string; desc: string }> = {
  'first-blood':     { emoji: '🩸', label: 'First Blood',     desc: 'First merged PR of the week' },
  'bug-slayer':      { emoji: '🐛', label: 'Bug Slayer',      desc: '10+ bug issues closed' },
  'code-monk':       { emoji: '🧘', label: 'Code Monk',       desc: '100+ commits in a month' },
  'reviewer-sensei': { emoji: '🥋', label: 'Reviewer Sensei', desc: '50+ reviews submitted' },
  'streak-lord':     { emoji: '🔥', label: 'Streak Lord',     desc: '7+ day commit streak' },
  'ghost':           { emoji: '👻', label: 'Ghost',           desc: 'No activity in 14 days' },
  'awakening':       { emoji: '⚡', label: 'Awakening',       desc: 'Jumped 2+ tiers this week' },
};

export function BadgeChip({ id, size = 'md' }: { id: BadgeId; size?: 'sm' | 'md' }) {
  const meta = BADGE_META[id];
  const sizes = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';
  return (
    <span
      title={meta.desc}
      className={`inline-flex items-center gap-1 rounded-full glass border border-neon-purple/30 ${sizes}`}
    >
      <span>{meta.emoji}</span>
      <span className="font-display tracking-wider uppercase">{meta.label}</span>
    </span>
  );
}

export { BADGE_META };
