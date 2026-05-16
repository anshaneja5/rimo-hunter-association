'use client';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { TierLetter } from '@/lib/types';

const TIER_INDEX: Record<TierLetter, number> = { E: 1, D: 2, C: 3, B: 4, A: 5, S: 6 };
const TIER_FROM_INDEX: Record<number, TierLetter> = { 1: 'E', 2: 'D', 3: 'C', 4: 'B', 5: 'A', 6: 'S' };

export function RankHistoryChart({ history }: {
  history: Array<{ weekStart: string; tier: TierLetter; xp: number }>;
}) {
  const data = history.map((h) => ({
    week: h.weekStart.slice(5, 10),
    tier: TIER_INDEX[h.tier],
    xp: h.xp,
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis dataKey="week" stroke="#52525b" fontSize={11} />
        <YAxis
          domain={[1, 6]}
          ticks={[1, 2, 3, 4, 5, 6]}
          tickFormatter={(v) => TIER_FROM_INDEX[v] ?? ''}
          stroke="#52525b"
          fontSize={11}
        />
        <Tooltip
          contentStyle={{ background: '#0f0f1e', border: '1px solid rgba(168,85,247,0.3)' }}
          labelStyle={{ color: '#a855f7' }}
        />
        <Line type="monotone" dataKey="tier" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#22d3ee' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
