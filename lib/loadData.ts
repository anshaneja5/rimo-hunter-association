import type {
  MembersFile, StatsFile, MVPsFile, RankHistoryFile, SquadsFile, Period, MemberProfile, RankingEntry,
} from './types';

async function loadJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return (await res.json()) as T;
}

export const loadMembers = () => loadJson<MembersFile>('/data/members.json');
export const loadStats = (period: Period) => loadJson<StatsFile>(`/data/stats-${period}.json`);
export const loadMvps = () => loadJson<MVPsFile>('/data/mvps.json');
export const loadRankHistory = () => loadJson<RankHistoryFile>('/data/rank-history.json');
export const loadSquads = () => loadJson<SquadsFile>('/data/squads.json');

export function findMember(members: MemberProfile[], login: string): MemberProfile | undefined {
  return members.find((m) => m.login === login);
}

export function findRanking(stats: StatsFile, login: string): RankingEntry | undefined {
  return stats.rankings.find((r) => r.login === login);
}
