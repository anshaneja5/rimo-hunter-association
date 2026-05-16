import type { BadgeId, RawActivityEvent, TierLetter } from './types';
import { jstDayStart, jstMonthStart, jstWeekStart, jstWeekEnd, isWithinWindow } from './date';

const TIER_ORDER: TierLetter[] = ['E', 'D', 'C', 'B', 'A', 'S'];

interface BadgeInput {
  login: string;
  allTimeEvents: RawActivityEvent[];
  allOrgWeeklyMerges: Array<{ login: string; occurredAt: string }>;
  now: Date;
  previousWeekTier?: TierLetter;
  currentWeekTier?: TierLetter;
}

export function computeBadges(input: BadgeInput): BadgeId[] {
  const badges: BadgeId[] = [];
  const { login, allTimeEvents, allOrgWeeklyMerges, now } = input;

  // first-blood: earliest merger in current JST week
  const weekStart = jstWeekStart(now);
  const weekEnd = jstWeekEnd(now);
  const mergesThisWeek = allOrgWeeklyMerges
    .filter((m) => isWithinWindow(m.occurredAt, weekStart, weekEnd))
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  if (mergesThisWeek.length && mergesThisWeek[0].login === login) {
    badges.push('first-blood');
  }

  // bug-slayer: ≥10 issuesClosed events with labels containing 'bug'
  const bugClosures = allTimeEvents.filter(
    (e) =>
      e.type === 'issuesClosed' &&
      Array.isArray((e.meta as { labels?: string[] } | undefined)?.labels) &&
      ((e.meta as { labels: string[] }).labels.includes('bug')),
  );
  if (bugClosures.length >= 10) badges.push('bug-slayer');

  // code-monk: 100+ commits in any single calendar month
  const commitsByMonth = new Map<string, number>();
  for (const e of allTimeEvents) {
    if (e.type !== 'commits') continue;
    const monthKey = jstMonthStart(new Date(e.occurredAt)).toISOString();
    commitsByMonth.set(monthKey, (commitsByMonth.get(monthKey) ?? 0) + 1);
  }
  if ([...commitsByMonth.values()].some((c) => c >= 100)) badges.push('code-monk');

  // reviewer-sensei: ≥50 reviews lifetime
  const totalReviews = allTimeEvents.filter((e) => e.type === 'reviews').length;
  if (totalReviews >= 50) badges.push('reviewer-sensei');

  // streak-lord: 7+ consecutive JST days with commits
  const commitDays = new Set<string>();
  for (const e of allTimeEvents) {
    if (e.type !== 'commits') continue;
    commitDays.add(jstDayStart(new Date(e.occurredAt)).toISOString());
  }
  const sortedDays = [...commitDays].sort();
  let longest = 0;
  let current = 0;
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      current = 1;
    } else {
      const prev = new Date(sortedDays[i - 1]).getTime();
      const cur = new Date(sortedDays[i]).getTime();
      current = cur - prev === 24 * 60 * 60 * 1000 ? current + 1 : 1;
    }
    longest = Math.max(longest, current);
  }
  if (longest >= 7) badges.push('streak-lord');

  // ghost: zero activity in last 14 days
  const cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const hasRecent = allTimeEvents.some((e) => new Date(e.occurredAt) >= cutoff);
  if (!hasRecent) badges.push('ghost');

  // awakening: ≥2 tier jump week-over-week
  if (input.previousWeekTier && input.currentWeekTier) {
    const prevIdx = TIER_ORDER.indexOf(input.previousWeekTier);
    const curIdx = TIER_ORDER.indexOf(input.currentWeekTier);
    if (curIdx - prevIdx >= 2) badges.push('awakening');
  }

  return badges;
}
