import { promises as fs } from 'node:fs';
import path from 'node:path';
import { notFound } from 'next/navigation';
import { HunterProfileView } from '@/components/HunterProfileView';
import type { MembersFile, StatsFile, RankHistoryFile, Breakdown } from '@/lib/types';
import { EMPTY_BREAKDOWN } from '@/lib/types';

async function readData() {
  const dir = path.resolve(process.cwd(), 'public/data');
  const [members, all, weekly, monthly, daily, history] = await Promise.all([
    fs.readFile(path.join(dir, 'members.json'), 'utf8').then((s) => JSON.parse(s) as MembersFile),
    fs.readFile(path.join(dir, 'stats-all.json'), 'utf8').then((s) => JSON.parse(s) as StatsFile),
    fs.readFile(path.join(dir, 'stats-weekly.json'), 'utf8').then((s) => JSON.parse(s) as StatsFile),
    fs.readFile(path.join(dir, 'stats-monthly.json'), 'utf8').then((s) => JSON.parse(s) as StatsFile),
    fs.readFile(path.join(dir, 'stats-daily.json'), 'utf8').then((s) => JSON.parse(s) as StatsFile),
    fs.readFile(path.join(dir, 'rank-history.json'), 'utf8').then((s) => JSON.parse(s) as RankHistoryFile),
  ]);
  return { members, all, weekly, monthly, daily, history };
}

export async function generateStaticParams() {
  const dir = path.resolve(process.cwd(), 'public/data');
  const file = await fs.readFile(path.join(dir, 'members.json'), 'utf8');
  const data = JSON.parse(file) as MembersFile;
  return data.members.map((m) => ({ username: m.login }));
}

// Compute per-metric leader values across the org (the silhouette of "what the top hunter looks like").
// Each axis is the org maximum for that single metric — not necessarily the same person on each axis.
function buildOrgMax(stats: StatsFile): Breakdown {
  const max: Breakdown = { ...EMPTY_BREAKDOWN };
  for (const r of stats.rankings) {
    const b = r.breakdown;
    if (b.prsMerged    > max.prsMerged)    max.prsMerged = b.prsMerged;
    if (b.prsOpened    > max.prsOpened)    max.prsOpened = b.prsOpened;
    if (b.reviews      > max.reviews)      max.reviews = b.reviews;
    if (b.issuesClosed > max.issuesClosed) max.issuesClosed = b.issuesClosed;
    if (b.issuesOpened > max.issuesOpened) max.issuesOpened = b.issuesOpened;
    if (b.commits      > max.commits)      max.commits = b.commits;
    if (b.comments     > max.comments)     max.comments = b.comments;
  }
  return max;
}

export default async function HunterPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { members, all, weekly, monthly, daily, history } = await readData();
  const member = members.members.find((m) => m.login === username);
  if (!member) notFound();

  const orgMax = buildOrgMax(all);

  return (
    <HunterProfileView
      member={member}
      allTime={all.rankings.find((r) => r.login === username)}
      weekly={weekly.rankings.find((r) => r.login === username)}
      monthly={monthly.rankings.find((r) => r.login === username)}
      daily={daily.rankings.find((r) => r.login === username)}
      history={history.byLogin[username] ?? []}
      maxXp={{
        all: all.rankings[0]?.xp ?? 1,
        weekly: weekly.rankings[0]?.xp ?? 1,
        monthly: monthly.rankings[0]?.xp ?? 1,
        daily: daily.rankings[0]?.xp ?? 1,
      }}
      orgMax={orgMax}
    />
  );
}
