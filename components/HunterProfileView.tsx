'use client';
import { useT } from './I18nProvider';
import { RankBadge } from './RankBadge';
import { BadgeChip } from './BadgeChip';
import { XPBar } from './XPBar';
import { StatRadial } from './StatRadial';
import { RankHistoryChart } from './RankHistoryChart';
import type { MemberProfile, RankingEntry, TierLetter } from '@/lib/types';

interface Props {
  member: MemberProfile;
  allTime?: RankingEntry;
  weekly?: RankingEntry;
  monthly?: RankingEntry;
  daily?: RankingEntry;
  history: Array<{ weekStart: string; tier: TierLetter; xp: number }>;
  maxXp: { all: number; weekly: number; monthly: number; daily: number };
}

export function HunterProfileView({ member, allTime, weekly, monthly, daily, history, maxXp }: Props) {
  const t = useT();
  const tier: TierLetter = allTime?.tier ?? 'E';

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
                <div className="font-display uppercase tracking-widest text-sm">{t(`tier.${tier}` as const)}</div>
                <div className="text-zinc-500 text-xs">{t('hunter.allTimeRank')} #{allTime?.rankNumber ?? '—'}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <PeriodStat label={t('periodLabel.today')} xp={daily?.xp ?? 0} tier={daily?.tier ?? 'E'} max={maxXp.daily} />
              <PeriodStat label={t('periodLabel.thisWeek')} xp={weekly?.xp ?? 0} tier={weekly?.tier ?? 'E'} max={maxXp.weekly} />
              <PeriodStat label={t('periodLabel.thisMonth')} xp={monthly?.xp ?? 0} tier={monthly?.tier ?? 'E'} max={maxXp.monthly} />
              <PeriodStat label={t('periodLabel.allTime')} xp={allTime?.xp ?? 0} tier={tier} max={maxXp.all} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display uppercase tracking-widest text-sm text-zinc-400 mb-4">{t('hunter.statBreakdown')}</h2>
          {allTime && <StatRadial breakdown={allTime.breakdown} />}
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display uppercase tracking-widest text-sm text-zinc-400 mb-4">{t('hunter.rankHistory')}</h2>
          <RankHistoryChart history={history} />
        </div>
      </div>

      {allTime && allTime.badges.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display uppercase tracking-widest text-sm text-zinc-400 mb-4">{t('hunter.badgesEarned')}</h2>
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
