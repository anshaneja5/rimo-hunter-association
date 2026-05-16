import { promises as fs } from 'node:fs';
import path from 'node:path';
import { notFound } from 'next/navigation';
import { RankBadge, TIER_LABEL } from '@/components/RankBadge';
import { BadgeChip } from '@/components/BadgeChip';
import { XPBar } from '@/components/XPBar';
import { StatRadial } from '@/components/StatRadial';
import { RankHistoryChart } from '@/components/RankHistoryChart';
import type { MembersFile, StatsFile, RankHistoryFile, TierLetter } from '@/lib/types';

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

export default async function HunterPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { members, all, weekly, monthly, daily, history } = await readData();
  const member = members.members.find((m) => m.login === username);
  if (!member) notFound();

  const allTime = all.rankings.find((r) => r.login === username);
  const w = weekly.rankings.find((r) => r.login === username);
  const m = monthly.rankings.find((r) => r.login === username);
  const d = daily.rankings.find((r) => r.login === username);
  const tier = allTime?.tier ?? 'E';
  const userHistory = history.byLogin[username] ?? [];

  return (
    <div className="space-y-8">
      <div className="glass rounded-3xl p-8 md:p-10 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 font-display text-[320px] leading-none opacity-10 select-none">{tier}</div>
        <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start">
          <img src={member.avatarUrl} alt={member.login} className="h-40 w-40 rounded-full ring-4 ring-neon-purple shadow-glow-a" />
          <div className="flex-1">
            <h1 className="font-display text-5xl font-bold tracking-wide mb-1">{member.name ?? member.login}</h1>
            <div className="text-zinc-400 mb-3">@{member.login}</div>
            {member.bio && <p className="text-zinc-300 mb-4">{member.bio}</p>}
            <div className="flex items-center gap-4 mb-4">
              <RankBadge tier={tier} size="lg" />
              <div>
                <div className="font-display uppercase tracking-widest text-sm">{TIER_LABEL[tier]}</div>
                <div className="text-zinc-500 text-xs">All-time rank #{allTime?.rankNumber ?? '—'}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <PeriodStat label="Today" xp={d?.xp ?? 0} tier={d?.tier ?? 'E'} max={daily.rankings[0]?.xp ?? 1} />
              <PeriodStat label="This week" xp={w?.xp ?? 0} tier={w?.tier ?? 'E'} max={weekly.rankings[0]?.xp ?? 1} />
              <PeriodStat label="This month" xp={m?.xp ?? 0} tier={m?.tier ?? 'E'} max={monthly.rankings[0]?.xp ?? 1} />
              <PeriodStat label="All-time" xp={allTime?.xp ?? 0} tier={tier} max={all.rankings[0]?.xp ?? 1} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display uppercase tracking-widest text-sm text-zinc-400 mb-4">Stat breakdown (all-time)</h2>
          {allTime && <StatRadial breakdown={allTime.breakdown} />}
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display uppercase tracking-widest text-sm text-zinc-400 mb-4">Rank history</h2>
          <RankHistoryChart history={userHistory} />
        </div>
      </div>

      {allTime && allTime.badges.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display uppercase tracking-widest text-sm text-zinc-400 mb-4">Badges earned</h2>
          <div className="flex flex-wrap gap-2">
            {allTime.badges.map((b) => <BadgeChip key={b} id={b} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function PeriodStat({ label, xp, tier, max }: { label: string; xp: number; tier: TierLetter; max: number }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="text-xs uppercase tracking-widest text-zinc-500 mb-1">{label}</div>
      <XPBar xp={xp} max={max} tier={tier} />
    </div>
  );
}
