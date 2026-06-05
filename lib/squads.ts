import type { Squad, SquadMember, SquadsFile } from './types';

export const GUILD_NAMES = [
  'Black Blade Guild',
  'Shadow Monarchs',
  'Iron Fang Corps',
  'Crimson Gate Hunters',
  'Silver Arrow Guild',
  'White Tiger Guild',
  'Blue Flame Order',
  'Storm Breakers',
  'Phantom Vanguard',
  'Golden Shield Society',
  'Twilight Hunters',
  'Eternal Dark Guild',
];

export function computeSquadCount(memberCount: number): number {
  return Math.max(1, Math.round(memberCount / 4.5));
}

function snakeDraft(members: SquadMember[], squadCount: number): SquadMember[][] {
  const squads: SquadMember[][] = Array.from({ length: squadCount }, () => []);
  let direction = 1;
  let pos = 0;
  for (const member of members) {
    squads[pos].push(member);
    const next = pos + direction;
    if (next < 0 || next >= squadCount) {
      direction *= -1;
      // stay at this end — next pick is same squad (classic snake draft double-pick at ends)
    } else {
      pos = next;
    }
  }
  return squads;
}

function rankSquads(squads: Squad[]): Squad[] {
  const sorted = [...squads].sort((a, b) => b.totalXp - a.totalXp);
  return sorted.map((sq, i) => ({ ...sq, rank: i + 1 }));
}

export function buildSquads(
  weeklyRankings: Array<{ login: string; xp: number }>,
  isoWeek: number,
  weekStart: string,
  generatedAt: string,
  existing?: SquadsFile,
): SquadsFile {
  // Same week: preserve assignments, update scores
  if (existing && existing.isoWeek === isoWeek) {
    const xpByLogin = new Map(weeklyRankings.map((r) => [r.login, r.xp]));
    const updated = existing.squads.map((sq) => {
      const members = sq.members.map((m) => ({ login: m.login, weeklyXp: xpByLogin.get(m.login) ?? 0 }));
      return { ...sq, members, totalXp: members.reduce((s, m) => s + m.weeklyXp, 0) };
    });
    return { generatedAt, isoWeek, weekStart: existing.weekStart, squads: rankSquads(updated) };
  }

  // New week: fresh snake draft
  const sorted = [...weeklyRankings].sort((a, b) => b.xp - a.xp || a.login.localeCompare(b.login));
  const N = computeSquadCount(sorted.length);
  const draftedGroups = snakeDraft(sorted.map((r) => ({ login: r.login, weeklyXp: r.xp })), N);
  const squads: Squad[] = draftedGroups.map((members, draftIndex) => ({
    index: draftIndex,
    name: GUILD_NAMES[(draftIndex + isoWeek) % GUILD_NAMES.length],
    totalXp: members.reduce((s, m) => s + m.weeklyXp, 0),
    rank: 0,
    members,
  }));
  return { generatedAt, isoWeek, weekStart, squads: rankSquads(squads) };
}
