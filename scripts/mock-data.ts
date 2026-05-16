import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { assignTiers } from '../lib/scoring';
import { jstWeekStart, jstWeekEnd, jstMonthStart, jstMonthEnd, jstDayStart, jstDayEnd } from '../lib/date';
import type {
  MembersFile, StatsFile, MVPsFile, RankHistoryFile, MemberProfile, Period, RankingEntry, BadgeId, Breakdown,
} from '../lib/types';
import { EMPTY_BREAKDOWN } from '../lib/types';

const NAMES = [
  'akari', 'haruto', 'yuki', 'sora', 'ren', 'hina', 'kaito', 'miyu',
  'shun', 'asuka', 'kenji', 'naoko', 'taro', 'rumi', 'daichi', 'sakura',
  'ryu', 'mei', 'jin', 'aoi', 'kazuki', 'nami', 'shogo', 'yuna',
  'kei', 'ami', 'tsubasa', 'rina', 'goro', 'satomi',
];
const ALL_BADGES: BadgeId[] = ['first-blood', 'bug-slayer', 'code-monk', 'reviewer-sensei', 'streak-lord', 'ghost', 'awakening'];

function rand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function buildPeriod(period: Period, members: MemberProfile[], windowStart: Date | null, windowEnd: Date, seed: number): StatsFile {
  const r = rand(seed);
  const scale = period === 'daily' ? 5 : period === 'weekly' ? 30 : period === 'monthly' ? 120 : 500;
  const entries = members.map((m) => ({
    login: m.login,
    xp: Math.round(r() * scale + r() * (scale / 2)),
    totalCommits: Math.round(r() * scale),
  }));
  const ranked = assignTiers(entries);
  const dayCount = period === 'daily' ? 1 : period === 'weekly' ? 7 : period === 'monthly' ? 30 : 14;
  const rankings: RankingEntry[] = ranked.map((re) => {
    const xp = re.xp;
    const breakdown: Breakdown = {
      prsMerged: Math.round(xp * 0.05),
      prsOpened: Math.round(xp * 0.04),
      reviews: Math.round(xp * 0.08),
      issuesClosed: Math.round(xp * 0.03),
      issuesOpened: Math.round(xp * 0.04),
      commits: Math.round(xp * 0.4),
      comments: Math.round(xp * 0.1),
    };
    const badges = ALL_BADGES.filter(() => r() < 0.15);
    return {
      login: re.login,
      xp,
      tier: re.tier,
      rankNumber: re.rankNumber,
      breakdown,
      badges,
      sparkline: Array.from({ length: dayCount }, () => Math.round(r() * 10)),
    };
  });
  return {
    generatedAt: new Date().toISOString(),
    period,
    windowStart: windowStart?.toISOString() ?? null,
    windowEnd: windowEnd.toISOString(),
    rankings,
  };
}

async function main() {
  const now = new Date();
  const members: MemberProfile[] = NAMES.map((n, i) => ({
    login: n,
    name: n.charAt(0).toUpperCase() + n.slice(1),
    avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${n}`,
    bio: i % 3 === 0 ? `Engineer @ Rimo · loves ${['ramen', 'gundam', 'kdramas', 'pixel art'][i % 4]}` : null,
    htmlUrl: `https://github.com/${n}`,
  }));

  const DATA_DIR = path.resolve(process.cwd(), 'public/data');
  await mkdir(DATA_DIR, { recursive: true });

  const membersFile: MembersFile = { generatedAt: now.toISOString(), members };
  await writeFile(path.join(DATA_DIR, 'members.json'), JSON.stringify(membersFile, null, 2));

  const allStats = buildPeriod('all', members, null, now, 1);
  const monthlyStats = buildPeriod('monthly', members, jstMonthStart(now), jstMonthEnd(now), 2);
  const weeklyStats = buildPeriod('weekly', members, jstWeekStart(now), jstWeekEnd(now), 3);
  const dailyStats = buildPeriod('daily', members, jstDayStart(now), jstDayEnd(now), 4);

  await writeFile(path.join(DATA_DIR, 'stats-all.json'), JSON.stringify(allStats, null, 2));
  await writeFile(path.join(DATA_DIR, 'stats-monthly.json'), JSON.stringify(monthlyStats, null, 2));
  await writeFile(path.join(DATA_DIR, 'stats-weekly.json'), JSON.stringify(weeklyStats, null, 2));
  await writeFile(path.join(DATA_DIR, 'stats-daily.json'), JSON.stringify(dailyStats, null, 2));

  const mvps: MVPsFile = {
    weekly: Array.from({ length: 8 }, (_, i) => {
      const ws = new Date(jstWeekStart(now).getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const r = weeklyStats.rankings[i % weeklyStats.rankings.length];
      return { weekStart: ws.toISOString(), login: r.login, xp: r.xp, snapshot: r.breakdown };
    }),
    monthly: Array.from({ length: 6 }, (_, i) => {
      const m = new Date(jstMonthStart(now));
      m.setUTCMonth(m.getUTCMonth() - (i + 1));
      const r = monthlyStats.rankings[i % monthlyStats.rankings.length];
      return { month: m.toISOString().slice(0, 7), login: r.login, xp: r.xp, snapshot: r.breakdown };
    }),
  };
  await writeFile(path.join(DATA_DIR, 'mvps.json'), JSON.stringify(mvps, null, 2));

  const rankHistory: RankHistoryFile = { byLogin: {} };
  const tiers: Array<'S' | 'A' | 'B' | 'C' | 'D' | 'E'> = ['S', 'A', 'B', 'C', 'D', 'E'];
  for (const m of members) {
    rankHistory.byLogin[m.login] = Array.from({ length: 12 }, (_, i) => {
      const ws = new Date(jstWeekStart(now).getTime() - (11 - i) * 7 * 24 * 60 * 60 * 1000);
      return { weekStart: ws.toISOString(), tier: tiers[Math.floor(Math.random() * tiers.length)], xp: Math.round(Math.random() * 200) };
    });
  }
  await writeFile(path.join(DATA_DIR, 'rank-history.json'), JSON.stringify(rankHistory, null, 2));

  console.log('[mock-data] wrote', DATA_DIR);
}

main().catch((err) => { console.error(err); process.exit(1); });
