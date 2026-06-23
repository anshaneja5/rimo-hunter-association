import { describe, it, expect } from 'vitest';
import { computeBadges } from '../badges';
import type { RawActivityEvent } from '../types';

function mkEvent(
  type: RawActivityEvent['type'],
  occurredAt: string,
  meta?: Record<string, unknown>,
): RawActivityEvent {
  return { type, repoOwner: 'rimo', repoName: 'app', occurredAt, meta };
}

describe('computeBadges', () => {
  const now = new Date('2026-05-16T05:00:00Z'); // Sat in JST

  it('awards first-blood if user is first to merge a PR this week', () => {
    const events = [mkEvent('prsMerged', '2026-05-12T03:00:00Z')];
    const allOrgMergesThisWeek = [
      { login: 'me', occurredAt: '2026-05-12T03:00:00Z' },
      { login: 'other', occurredAt: '2026-05-13T03:00:00Z' },
    ];
    const result = computeBadges({ login: 'me', allTimeEvents: events, allOrgWeeklyMerges: allOrgMergesThisWeek, now });
    expect(result).toContain('first-blood');
  });

  it('does not award first-blood if another user merged first this week', () => {
    const allOrgMergesThisWeek = [
      { login: 'other', occurredAt: '2026-05-12T03:00:00Z' },
      { login: 'me', occurredAt: '2026-05-13T03:00:00Z' },
    ];
    const result = computeBadges({ login: 'me', allTimeEvents: [], allOrgWeeklyMerges: allOrgMergesThisWeek, now });
    expect(result).not.toContain('first-blood');
  });

  it('awards bug-slayer for 10+ closed bug-labeled issues', () => {
    const events: RawActivityEvent[] = Array.from({ length: 10 }, (_, i) =>
      mkEvent('issuesClosed', '2026-01-01T00:00:00Z', { labels: ['bug'] }),
    );
    const result = computeBadges({ login: 'me', allTimeEvents: events, allOrgWeeklyMerges: [], now });
    expect(result).toContain('bug-slayer');
  });

  it('does not award bug-slayer at 9 closed bug issues', () => {
    const events: RawActivityEvent[] = Array.from({ length: 9 }, () =>
      mkEvent('issuesClosed', '2026-01-01T00:00:00Z', { labels: ['bug'] }),
    );
    const result = computeBadges({ login: 'me', allTimeEvents: events, allOrgWeeklyMerges: [], now });
    expect(result).not.toContain('bug-slayer');
  });

  it('awards code-monk for 100+ commits in a calendar month', () => {
    const events = Array.from({ length: 100 }, (_, i) =>
      mkEvent('commits', `2026-04-${String(((i % 28) + 1)).padStart(2, '0')}T05:00:00Z`),
    );
    const result = computeBadges({ login: 'me', allTimeEvents: events, allOrgWeeklyMerges: [], now });
    expect(result).toContain('code-monk');
  });

  it('awards reviewer-sensei for 50+ reviews lifetime', () => {
    const events = Array.from({ length: 50 }, () => mkEvent('reviews', '2026-01-01T00:00:00Z'));
    const result = computeBadges({ login: 'me', allTimeEvents: events, allOrgWeeklyMerges: [], now });
    expect(result).toContain('reviewer-sensei');
  });

  it('awards streak-lord for 7+ consecutive commit days', () => {
    const events = [
      mkEvent('commits', '2026-05-10T03:00:00Z'),
      mkEvent('commits', '2026-05-11T03:00:00Z'),
      mkEvent('commits', '2026-05-12T03:00:00Z'),
      mkEvent('commits', '2026-05-13T03:00:00Z'),
      mkEvent('commits', '2026-05-14T03:00:00Z'),
      mkEvent('commits', '2026-05-15T03:00:00Z'),
      mkEvent('commits', '2026-05-16T03:00:00Z'),
    ];
    const result = computeBadges({ login: 'me', allTimeEvents: events, allOrgWeeklyMerges: [], now });
    expect(result).toContain('streak-lord');
  });

  it('awards ghost for zero activity in last 14 days', () => {
    const events = [mkEvent('commits', '2026-01-01T00:00:00Z')];
    const result = computeBadges({ login: 'me', allTimeEvents: events, allOrgWeeklyMerges: [], now });
    expect(result).toContain('ghost');
  });

  it('does not award ghost if user has activity in last 14 days', () => {
    const events = [mkEvent('commits', '2026-05-10T03:00:00Z')];
    const result = computeBadges({ login: 'me', allTimeEvents: events, allOrgWeeklyMerges: [], now });
    expect(result).not.toContain('ghost');
  });

  it('awards awakening when previousWeekTier→currentWeekTier jumps ≥2 tiers', () => {
    const result = computeBadges({
      login: 'me',
      allTimeEvents: [],
      allOrgWeeklyMerges: [],
      now,
      previousWeekTier: 'D',
      currentWeekTier: 'B',
    });
    expect(result).toContain('awakening');
  });

  it('does not award awakening for a 1-tier jump', () => {
    const result = computeBadges({
      login: 'me',
      allTimeEvents: [],
      allOrgWeeklyMerges: [],
      now,
      previousWeekTier: 'C',
      currentWeekTier: 'B',
    });
    expect(result).not.toContain('awakening');
  });
});
