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
  'Red Gate Runners',
  'Crimson Emperor Order',
  'Void Walker Corps',
  'Ashen Blade Society',
  'Neon Samurai Guild',
  'Obsidian Fang Clan',
  'Steel Lotus Order',
  'Dragon Scale Guild',
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
  // Roster of members eligible for squads this week. Defaults to the weekly rankings, but the
  // pipeline passes a trailing-7-day active set so a brand-new week is sized from a full roster
  // instead of the 2-3 members who happen to have logged activity in the week's first few hours.
  draftPool?: Array<{ login: string; xp: number }>,
): SquadsFile {
  const xpByLogin = new Map(weeklyRankings.map((r) => [r.login, r.xp]));
  const weeklyXp = (login: string): number => xpByLogin.get(login) ?? 0;

  // Active roster used for sizing + draft order (trailing window if provided, else this week).
  const pool = [...(draftPool ?? weeklyRankings)]
    .filter((r) => r.xp > 0)
    .sort((a, b) => b.xp - a.xp || a.login.localeCompare(b.login));
  const targetCount = computeSquadCount(pool.length);

  const sameWeek = !!existing && existing.isoWeek === isoWeek;
  const outWeekStart = sameWeek ? existing!.weekStart : weekStart;

  // Same week AND the existing squads are still big enough for the roster: keep assignments,
  // refresh scores, and fold in anyone newly active who isn't on a squad yet. (An undersized
  // week — e.g. one drafted before most members were active — falls through to a fresh draft.)
  if (sameWeek && existing && existing.squads.length >= targetCount) {
    const assigned = new Set(existing.squads.flatMap((sq) => sq.members.map((m) => m.login)));
    const squads = existing.squads.map((sq) => ({
      ...sq,
      members: sq.members.map((m) => ({ login: m.login, weeklyXp: weeklyXp(m.login) })),
    }));
    for (const r of pool) {
      if (assigned.has(r.login)) continue;
      // place each newcomer on the smallest squad (ties → lowest index) to keep sizes balanced
      let target = squads[0];
      for (const sq of squads) if (sq.members.length < target.members.length) target = sq;
      target.members.push({ login: r.login, weeklyXp: weeklyXp(r.login) });
      assigned.add(r.login);
    }
    const scored = squads.map((sq) => ({ ...sq, totalXp: sq.members.reduce((s, m) => s + m.weeklyXp, 0) }));
    return { generatedAt, isoWeek, weekStart: outWeekStart, squads: rankSquads(scored) };
  }

  // Fresh snake draft: new week, no existing squads, or an undersized week that needs repair.
  const draftedGroups = snakeDraft(pool.map((r) => ({ login: r.login, weeklyXp: weeklyXp(r.login) })), targetCount);
  const squads: Squad[] = draftedGroups.map((members, draftIndex) => ({
    index: draftIndex,
    name: GUILD_NAMES[(draftIndex + isoWeek) % GUILD_NAMES.length],
    totalXp: members.reduce((s, m) => s + m.weeklyXp, 0),
    rank: 0,
    members,
  }));
  return { generatedAt, isoWeek, weekStart: outWeekStart, squads: rankSquads(squads) };
}
