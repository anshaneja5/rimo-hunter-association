import { describe, it, expect } from 'vitest';
import { computeSquadCount, buildSquads, GUILD_NAMES } from '../squads';
import type { SquadsFile } from '../types';

const NOW = '2026-06-06T00:00:00Z';
const WEEK_START = '2026-06-01T15:00:00Z'; // Mon 2026-06-02 00:00 JST

function makeRankings(logins: string[], xpValues: number[]) {
  return logins.map((login, i) => ({ login, xp: xpValues[i] ?? 0 }));
}

// ── computeSquadCount ──────────────────────────────────────────────────────────

describe('computeSquadCount', () => {
  it('returns 3 for 12 members', () => expect(computeSquadCount(12)).toBe(3));
  it('returns 4 for 17 members', () => expect(computeSquadCount(17)).toBe(4));
  it('returns 4 for 20 members', () => expect(computeSquadCount(20)).toBe(4));
  it('returns 6 for 25 members', () => expect(computeSquadCount(25)).toBe(6));
  it('returns 1 for 1 member', () => expect(computeSquadCount(1)).toBe(1));
});

// ── buildSquads — fresh draft ──────────────────────────────────────────────────

describe('buildSquads — fresh draft (no existing or new week)', () => {
  const rankings = makeRankings(
    ['alice', 'bob', 'carol', 'dan', 'eve', 'frank', 'grace', 'hiro'],
    [100, 90, 80, 70, 60, 50, 40, 30],
  );

  const result = buildSquads(rankings, 23, WEEK_START, NOW);

  it('produces the correct squad count for 8 members', () => {
    expect(result.squads.length).toBe(computeSquadCount(8));
  });

  it('snake-drafts: top hunter in squad[0], second-highest in squad[N-1]', () => {
    const N = result.squads.length;
    const squad0Logins = result.squads.find((s) => s.index === 0)!.members.map((m) => m.login);
    const squadNLogins = result.squads.find((s) => s.index === N - 1)!.members.map((m) => m.login);
    expect(squad0Logins).toContain('alice'); // pick 1 → squad 0
    expect(squadNLogins).toContain('bob');   // pick 2 → squad N-1
  });

  it('squad score equals sum of member weeklyXp', () => {
    for (const sq of result.squads) {
      const sum = sq.members.reduce((acc, m) => acc + m.weeklyXp, 0);
      expect(sq.totalXp).toBeCloseTo(sum);
    }
  });

  it('squads are ranked 1-based and sorted by totalXp descending', () => {
    for (let i = 0; i < result.squads.length - 1; i++) {
      expect(result.squads[i].totalXp).toBeGreaterThanOrEqual(result.squads[i + 1].totalXp);
    }
    expect(result.squads[0].rank).toBe(1);
    const ranks = result.squads.map((s) => s.rank).sort((a, b) => a - b);
    expect(ranks).toEqual(Array.from({ length: result.squads.length }, (_, i) => i + 1));
  });

  it('assigns names from GUILD_NAMES rotated by isoWeek', () => {
    for (const sq of result.squads) {
      expect(sq.name).toBe(GUILD_NAMES[(sq.index + 23) % GUILD_NAMES.length]);
    }
  });

  it('uses isoWeek 24 to produce different names than isoWeek 23', () => {
    const r2 = buildSquads(rankings, 24, WEEK_START, NOW);
    const names23 = result.squads.map((s) => s.name);
    const names24 = r2.squads.map((s) => s.name);
    // At least one squad should have a different name
    expect(names23.join()).not.toBe(names24.join());
  });

  it('handles 1 member without crashing', () => {
    const r = buildSquads([{ login: 'solo', xp: 42 }], 5, WEEK_START, NOW);
    expect(r.squads.length).toBe(1);
    expect(r.squads[0].members[0].login).toBe('solo');
  });
});

// ── buildSquads — same-week preservation (AE3) ────────────────────────────────

describe('buildSquads — same-week preservation', () => {
  const initialRankings = makeRankings(['alice', 'bob', 'carol', 'dan'], [100, 80, 60, 40]);
  const initial = buildSquads(initialRankings, 23, WEEK_START, NOW);

  // alice earns more XP mid-week
  const updatedRankings = makeRankings(['alice', 'bob', 'carol', 'dan'], [150, 80, 60, 40]);
  const updated = buildSquads(updatedRankings, 23, WEEK_START, NOW, initial);

  it('preserves squad membership (same logins in same squads)', () => {
    for (const sq of initial.squads) {
      const originalLogins = sq.members.map((m) => m.login).sort();
      const updatedSq = updated.squads.find((s) => s.index === sq.index)!;
      const updatedLogins = updatedSq.members.map((m) => m.login).sort();
      expect(updatedLogins).toEqual(originalLogins);
    }
  });

  it('updates totalXp to reflect new scores (AE3)', () => {
    const aliceInitialSquad = initial.squads.find((s) => s.members.some((m) => m.login === 'alice'))!;
    const aliceUpdatedSquad = updated.squads.find((s) => s.index === aliceInitialSquad.index)!;
    expect(aliceUpdatedSquad.totalXp).toBeGreaterThan(aliceInitialSquad.totalXp);
  });

  it('updates individual member weeklyXp', () => {
    for (const sq of updated.squads) {
      const alice = sq.members.find((m) => m.login === 'alice');
      if (alice) expect(alice.weeklyXp).toBe(150);
    }
  });
});

// ── buildSquads — new week triggers fresh draft (AE1) ─────────────────────────

describe('buildSquads — new week triggers fresh draft', () => {
  const rankings = makeRankings(['alice', 'bob', 'carol', 'dan'], [100, 80, 60, 40]);
  const week23 = buildSquads(rankings, 23, WEEK_START, NOW);

  it('produces a new SquadsFile when isoWeek differs', () => {
    const week24 = buildSquads(rankings, 24, WEEK_START, NOW, week23);
    expect(week24.isoWeek).toBe(24);
    // Names change because the index+week rotation shifts
    const names23 = week23.squads.map((s) => s.name).join(',');
    const names24 = week24.squads.map((s) => s.name).join(',');
    expect(names23).not.toBe(names24);
  });
});

// ── determinism (AE1) ─────────────────────────────────────────────────────────

describe('buildSquads — determinism', () => {
  it('produces identical squad composition for the same inputs', () => {
    const rankings = makeRankings(['a', 'b', 'c', 'd', 'e'], [50, 40, 30, 20, 10]);
    const r1 = buildSquads(rankings, 21, WEEK_START, NOW);
    const r2 = buildSquads(rankings, 21, WEEK_START, NOW);
    expect(r1.squads.map((s) => s.members.map((m) => m.login).join(','))).toEqual(
      r2.squads.map((s) => s.members.map((m) => m.login).join(',')),
    );
  });
});

// ── existing squads with missing members ──────────────────────────────────────

describe('buildSquads — member leaves mid-week', () => {
  it('sets weeklyXp to 0 for a login not found in current rankings', () => {
    const initial = buildSquads(
      [{ login: 'alice', xp: 100 }, { login: 'bob', xp: 50 }],
      10, WEEK_START, NOW,
    );
    // bob is no longer in the rankings (removed from org)
    const updated = buildSquads([{ login: 'alice', xp: 110 }], 10, WEEK_START, NOW, initial);
    const bobEntry = updated.squads.flatMap((s) => s.members).find((m) => m.login === 'bob');
    expect(bobEntry?.weeklyXp).toBe(0);
  });
});
