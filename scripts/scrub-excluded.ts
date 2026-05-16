import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { assignTiers } from '../lib/scoring';
import type {
  MembersFile, StatsFile, MVPsFile, RankHistoryFile, RankingEntry,
} from '../lib/types';

const DATA_DIR = path.resolve(process.cwd(), 'public/data');
const OVERRIDE_PATH = path.resolve(process.cwd(), 'config/members-override.json');

const override = JSON.parse(readFileSync(OVERRIDE_PATH, 'utf8')) as { include: string[]; exclude: string[] };
const excluded = new Set(override.exclude);
console.log(`[scrub] Excluding ${excluded.size} logins:`, [...excluded].join(', '));

function rewriteJson<T>(file: string, transform: (data: T) => T): void {
  const p = path.join(DATA_DIR, file);
  if (!existsSync(p)) return;
  const data = JSON.parse(readFileSync(p, 'utf8')) as T;
  writeFileSync(p, JSON.stringify(transform(data), null, 2) + '\n');
  console.log(`[scrub] rewrote ${file}`);
}

rewriteJson<MembersFile>('members.json', (d) => ({
  ...d,
  members: d.members.filter((m) => !excluded.has(m.login)),
}));

for (const period of ['all', 'monthly', 'weekly', 'daily'] as const) {
  rewriteJson<StatsFile>(`stats-${period}.json`, (d) => {
    const filtered = d.rankings.filter((r) => !excluded.has(r.login));
    const reranked = assignTiers(
      filtered.map((r) => ({ login: r.login, xp: r.xp, totalCommits: r.breakdown.commits })),
    );
    const rankings: RankingEntry[] = reranked.map((re) => {
      const orig = filtered.find((r) => r.login === re.login)!;
      return { ...orig, tier: re.tier, rankNumber: re.rankNumber };
    });
    return { ...d, rankings };
  });
}

rewriteJson<MVPsFile>('mvps.json', (d) => ({
  weekly: d.weekly.filter((m) => !excluded.has(m.login)),
  monthly: d.monthly.filter((m) => !excluded.has(m.login)),
}));

rewriteJson<RankHistoryFile>('rank-history.json', (d) => {
  const byLogin: RankHistoryFile['byLogin'] = {};
  for (const [login, history] of Object.entries(d.byLogin)) {
    if (!excluded.has(login)) byLogin[login] = history;
  }
  return { byLogin };
});

console.log('[scrub] done.');
