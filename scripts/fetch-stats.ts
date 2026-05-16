import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

// Load .env locally if present. In CI, env vars are set by the GitHub Actions runner.
const envPath = path.resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    }
  }
}

import { createGithubClient } from '../lib/github';
import { computeXp, assignTiers } from '../lib/scoring';
import { computeBadges } from '../lib/badges';
import {
  jstDayStart, jstDayEnd,
  jstWeekStart, jstWeekEnd,
  jstMonthStart, jstMonthEnd,
  isWithinWindow,
} from '../lib/date';
import type {
  Period, RawActivityEvent, MembersFile, StatsFile, MVPsFile, RankHistoryFile,
  Breakdown, RankingEntry, MemberProfile,
} from '../lib/types';
import { EMPTY_BREAKDOWN } from '../lib/types';

const ORG = process.env.GITHUB_ORG ?? 'rimoapp';
const TOKEN = process.env.GITHUB_TOKEN;
const DATA_DIR = path.resolve(process.cwd(), 'public/data');
const OVERRIDE_PATH = path.resolve(process.cwd(), 'config/members-override.json');

if (!TOKEN) {
  console.error('GITHUB_TOKEN env var required');
  process.exit(1);
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function breakdownFromEvents(events: RawActivityEvent[]): Breakdown {
  const b: Breakdown = { ...EMPTY_BREAKDOWN };
  for (const e of events) {
    if (e.type in b) b[e.type as keyof Breakdown]++;
  }
  return b;
}

function sparkline(events: RawActivityEvent[], windowStart: Date, windowEnd: Date, dayCount: number): number[] {
  const buckets = new Array(dayCount).fill(0);
  const startMs = windowStart.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  for (const e of events) {
    const idx = Math.floor((new Date(e.occurredAt).getTime() - startMs) / dayMs);
    if (idx >= 0 && idx < dayCount) buckets[idx]++;
  }
  return buckets;
}

async function buildStatsFile(
  period: Period,
  windowStart: Date | null,
  windowEnd: Date,
  members: MemberProfile[],
  eventsByLogin: Map<string, RawActivityEvent[]>,
  allOrgMergesThisWeek: Array<{ login: string; occurredAt: string }>,
  previousWeekTiers: Map<string, RankingEntry['tier']>,
  now: Date,
): Promise<StatsFile> {
  const dayCount = windowStart
    ? Math.max(1, Math.round((windowEnd.getTime() - windowStart.getTime()) / (24 * 60 * 60 * 1000)))
    : 14;
  const sparklineStart = windowStart ?? new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const tierables = members.map((m) => {
    const all = eventsByLogin.get(m.login) ?? [];
    const windowed = windowStart
      ? all.filter((e) => isWithinWindow(e.occurredAt, windowStart, windowEnd))
      : all;
    return {
      login: m.login,
      xp: computeXp(windowed),
      totalCommits: windowed.filter((e) => e.type === 'commits').length,
      windowed,
      all,
    };
  });

  const ranked = assignTiers(tierables);

  const currentWeekTiersForBadges = new Map<string, RankingEntry['tier']>();
  if (period === 'weekly') for (const r of ranked) currentWeekTiersForBadges.set(r.login, r.tier);

  const rankings: RankingEntry[] = ranked.map((r) => {
    const ev = tierables.find((t) => t.login === r.login)!;
    const breakdown = breakdownFromEvents(ev.windowed);
    const badges = computeBadges({
      login: r.login,
      allTimeEvents: ev.all,
      allOrgWeeklyMerges: allOrgMergesThisWeek,
      now,
      previousWeekTier: previousWeekTiers.get(r.login),
      currentWeekTier: period === 'weekly' ? r.tier : currentWeekTiersForBadges.get(r.login),
    });
    return {
      login: r.login,
      xp: r.xp,
      tier: r.tier,
      rankNumber: r.rankNumber,
      breakdown,
      badges,
      sparkline: sparkline(ev.windowed, sparklineStart, windowEnd, dayCount),
    };
  });

  return {
    generatedAt: now.toISOString(),
    period,
    windowStart: windowStart?.toISOString() ?? null,
    windowEnd: windowEnd.toISOString(),
    rankings,
  };
}

async function main() {
  const now = new Date();
  console.log(`[fetch-stats] Starting at ${now.toISOString()} for org=${ORG}`);

  const gh = createGithubClient(TOKEN!);
  const override = await readJson<{ include: string[]; exclude: string[] }>(OVERRIDE_PATH, { include: [], exclude: [] });

  const orgMembers = await gh.fetchOrgMembers(ORG);
  const memberMap = new Map<string, MemberProfile>();
  for (const m of orgMembers) memberMap.set(m.login, m);
  for (const login of override.include) {
    if (!memberMap.has(login)) {
      memberMap.set(login, { login, name: null, avatarUrl: `https://github.com/${login}.png`, bio: null, htmlUrl: `https://github.com/${login}` });
    }
  }
  for (const login of override.exclude) memberMap.delete(login);
  const members = [...memberMap.values()];
  console.log(`[fetch-stats] ${members.length} members after overrides`);

  // Fetch 1 year of events per member. "All-time" badges are approximated from the trailing
  // 12 months — GitHub's contributionsCollection caps at 1 year per query and the extra cost
  // of multi-year pagination isn't worth it for a fun project.
  const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const eventsByLogin = new Map<string, RawActivityEvent[]>();
  let fetchFailures = 0;

  for (const m of members) {
    try {
      const events = await gh.fetchContributions(m.login, yearAgo.toISOString(), now.toISOString());
      eventsByLogin.set(m.login, events);
      console.log(`[fetch-stats] ${m.login}: ${events.length} events`);
    } catch (err) {
      fetchFailures++;
      console.error(`[fetch-stats] failed for ${m.login}, skipping:`, err);
    }
  }

  if (eventsByLogin.size === 0 && members.length > 0) {
    console.error(`[fetch-stats] ALL ${members.length} member fetches failed — refusing to overwrite stale JSON`);
    process.exit(1);
  }
  if (fetchFailures > 0) {
    console.warn(`[fetch-stats] continuing with ${eventsByLogin.size}/${members.length} successful fetches`);
  }

  // Compute "all org merges this week" for first-blood badge
  const weekStart = jstWeekStart(now);
  const weekEnd = jstWeekEnd(now);
  const allOrgMergesThisWeek: Array<{ login: string; occurredAt: string }> = [];
  for (const [login, events] of eventsByLogin) {
    for (const e of events) {
      if (e.type === 'prsMerged' && e.repoOwner === ORG && isWithinWindow(e.occurredAt, weekStart, weekEnd)) {
        allOrgMergesThisWeek.push({ login, occurredAt: e.occurredAt });
      }
    }
  }

  // Read previous rank history for awakening badge
  const rankHistory = await readJson<RankHistoryFile>(path.join(DATA_DIR, 'rank-history.json'), { byLogin: {} });
  const previousWeekTiers = new Map<string, RankingEntry['tier']>();
  const previousWeekKey = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  for (const [login, history] of Object.entries(rankHistory.byLogin)) {
    const prev = history.find((h) => h.weekStart === previousWeekKey);
    if (prev) previousWeekTiers.set(login, prev.tier);
  }

  // Build stats files
  const allStats = await buildStatsFile('all', null, now, members, eventsByLogin, allOrgMergesThisWeek, previousWeekTiers, now);
  const monthlyStats = await buildStatsFile('monthly', jstMonthStart(now), jstMonthEnd(now), members, eventsByLogin, allOrgMergesThisWeek, previousWeekTiers, now);
  const weeklyStats = await buildStatsFile('weekly', weekStart, weekEnd, members, eventsByLogin, allOrgMergesThisWeek, previousWeekTiers, now);
  const dailyStats = await buildStatsFile('daily', jstDayStart(now), jstDayEnd(now), members, eventsByLogin, allOrgMergesThisWeek, previousWeekTiers, now);

  // Update rank history (append current week if not present)
  const currentWeekKey = weekStart.toISOString();
  for (const r of weeklyStats.rankings) {
    if (!rankHistory.byLogin[r.login]) rankHistory.byLogin[r.login] = [];
    const existing = rankHistory.byLogin[r.login].find((h) => h.weekStart === currentWeekKey);
    if (existing) {
      existing.tier = r.tier;
      existing.xp = r.xp;
    } else {
      rankHistory.byLogin[r.login].push({ weekStart: currentWeekKey, tier: r.tier, xp: r.xp });
    }
    rankHistory.byLogin[r.login] = rankHistory.byLogin[r.login].slice(-52); // keep last 52 weeks
  }

  // Update MVPs file: snapshot at week boundary completion
  const mvps = await readJson<MVPsFile>(path.join(DATA_DIR, 'mvps.json'), { weekly: [], monthly: [] });
  const completedWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  if (!mvps.weekly.find((m) => m.weekStart === completedWeekStart)) {
    const prevWeekData = rankHistory.byLogin;
    let bestLogin: string | null = null;
    let bestXp = -1;
    for (const [login, hist] of Object.entries(prevWeekData)) {
      const h = hist.find((x) => x.weekStart === completedWeekStart);
      if (h && h.xp > bestXp) {
        bestXp = h.xp;
        bestLogin = login;
      }
    }
    if (bestLogin) {
      mvps.weekly.unshift({ weekStart: completedWeekStart, login: bestLogin, xp: bestXp, snapshot: EMPTY_BREAKDOWN });
    }
  }
  const currentMonthKey = jstMonthStart(now).toISOString().slice(0, 7);
  const top = monthlyStats.rankings[0];
  if (top) {
    const existing = mvps.monthly.find((m) => m.month === currentMonthKey);
    if (existing) {
      existing.login = top.login;
      existing.xp = top.xp;
      existing.snapshot = top.breakdown;
    } else {
      mvps.monthly.unshift({ month: currentMonthKey, login: top.login, xp: top.xp, snapshot: top.breakdown });
    }
  }

  // Write all files
  const membersFile: MembersFile = { generatedAt: now.toISOString(), members };
  await writeJson(path.join(DATA_DIR, 'members.json'), membersFile);
  await writeJson(path.join(DATA_DIR, 'stats-all.json'), allStats);
  await writeJson(path.join(DATA_DIR, 'stats-monthly.json'), monthlyStats);
  await writeJson(path.join(DATA_DIR, 'stats-weekly.json'), weeklyStats);
  await writeJson(path.join(DATA_DIR, 'stats-daily.json'), dailyStats);
  await writeJson(path.join(DATA_DIR, 'mvps.json'), mvps);
  await writeJson(path.join(DATA_DIR, 'rank-history.json'), rankHistory);

  console.log('[fetch-stats] Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
