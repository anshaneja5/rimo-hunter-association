import { describe, it, expect } from 'vitest';
import { xpForEvent, computeXp, assignTiers, ACTION_XP, RIMO_MULTIPLIER } from '../scoring';
import type { RawActivityEvent } from '../types';

const RIMO = 'rimo';

function ev(type: RawActivityEvent['type'], repoOwner = 'someone-else'): RawActivityEvent {
  return { type, repoOwner, repoName: 'repo', occurredAt: '2026-05-16T00:00:00Z' };
}

describe('xpForEvent', () => {
  it('returns the base XP for non-Rimo repos', () => {
    expect(xpForEvent(ev('prsMerged'))).toBe(ACTION_XP.prsMerged);
    expect(xpForEvent(ev('commits'))).toBe(ACTION_XP.commits);
  });

  it('applies the Rimo multiplier for rimo repos', () => {
    expect(xpForEvent(ev('prsMerged', RIMO))).toBe(ACTION_XP.prsMerged * RIMO_MULTIPLIER);
    expect(xpForEvent(ev('commits', RIMO))).toBe(ACTION_XP.commits * RIMO_MULTIPLIER);
  });

  it('returns 0 for non-XP event types', () => {
    expect(xpForEvent(ev('badge-source'))).toBe(0);
  });
});

describe('computeXp', () => {
  it('sums XP across a list of events', () => {
    const events: RawActivityEvent[] = [
      ev('prsMerged', RIMO), // 15
      ev('commits'),         // 1
      ev('reviews', RIMO),   // 4.5
    ];
    expect(computeXp(events)).toBeCloseTo(20.5);
  });

  it('returns 0 for an empty list', () => {
    expect(computeXp([])).toBe(0);
  });
});

describe('assignTiers — percentile mode (>= 20 members)', () => {
  it('assigns S to top 5%, A to next 10%, etc.', () => {
    const entries = Array.from({ length: 100 }, (_, i) => ({ login: `u${i}`, xp: 100 - i }));
    const ranked = assignTiers(entries);
    // Top 5 → S (5%)
    for (let i = 0; i < 5; i++) expect(ranked[i].tier).toBe('S');
    // Next 10 → A (5-14)
    for (let i = 5; i < 15; i++) expect(ranked[i].tier).toBe('A');
    // Next 20 → B (15-34)
    for (let i = 15; i < 35; i++) expect(ranked[i].tier).toBe('B');
    // Next 25 → C (35-59)
    for (let i = 35; i < 60; i++) expect(ranked[i].tier).toBe('C');
    // Next 25 → D (60-84)
    for (let i = 60; i < 85; i++) expect(ranked[i].tier).toBe('D');
    // Bottom 15 → E (85-99)
    for (let i = 85; i < 100; i++) expect(ranked[i].tier).toBe('E');
  });

  it('breaks ties using totalCommits then login ascending', () => {
    const entries = [
      { login: 'zed', xp: 50, totalCommits: 10 },
      { login: 'amy', xp: 50, totalCommits: 10 },
      { login: 'bob', xp: 50, totalCommits: 20 },
    ];
    const ranked = assignTiers(entries);
    expect(ranked.map((r) => r.login)).toEqual(['bob', 'amy', 'zed']);
  });

  it('assigns rankNumber 1-indexed from the top', () => {
    const entries = Array.from({ length: 30 }, (_, i) => ({ login: `u${i}`, xp: 30 - i }));
    const ranked = assignTiers(entries);
    expect(ranked[0].rankNumber).toBe(1);
    expect(ranked[29].rankNumber).toBe(30);
  });

  it('assigns E to anyone with 0 XP', () => {
    const entries = [
      { login: 'a', xp: 100 },
      { login: 'b', xp: 0 },
      { login: 'c', xp: 0 },
    ];
    const ranked = assignTiers(entries);
    expect(ranked.find((r) => r.login === 'b')?.tier).toBe('E');
    expect(ranked.find((r) => r.login === 'c')?.tier).toBe('E');
  });
});

describe('assignTiers — fixed thresholds mode (< 20 members)', () => {
  it('uses fixed XP thresholds when fewer than 20 members', () => {
    const entries = [
      { login: 's-tier', xp: 600 },
      { login: 'a-tier', xp: 300 },
      { login: 'b-tier', xp: 150 },
      { login: 'c-tier', xp: 50 },
      { login: 'd-tier', xp: 20 },
      { login: 'e-tier', xp: 5 },
    ];
    const ranked = assignTiers(entries);
    expect(ranked.find((r) => r.login === 's-tier')?.tier).toBe('S');
    expect(ranked.find((r) => r.login === 'a-tier')?.tier).toBe('A');
    expect(ranked.find((r) => r.login === 'b-tier')?.tier).toBe('B');
    expect(ranked.find((r) => r.login === 'c-tier')?.tier).toBe('C');
    expect(ranked.find((r) => r.login === 'd-tier')?.tier).toBe('D');
    expect(ranked.find((r) => r.login === 'e-tier')?.tier).toBe('E');
  });
});
