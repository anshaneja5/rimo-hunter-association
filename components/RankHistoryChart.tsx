'use client';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import type { TierLetter } from '@/lib/types';

const TIER_INDEX: Record<TierLetter, number> = { E: 1, D: 2, C: 3, B: 4, A: 5, S: 6 };
const TIER_FROM_INDEX: Record<number, TierLetter> = { 1: 'E', 2: 'D', 3: 'C', 4: 'B', 5: 'A', 6: 'S' };

const TIER_COLOR: Record<TierLetter, string> = {
  S: '#fbbf24',
  A: '#a855f7',
  B: '#22d3ee',
  C: '#7dd3fc',
  D: '#94a3b8',
  E: '#71717a',
};

export function RankHistoryChart({ history }: {
  history: Array<{ weekStart: string; tier: TierLetter; xp: number }>;
}) {
  // Empty state: nothing recorded yet
  if (history.length === 0) {
    return (
      <EmptyState
        title="No rank history yet"
        body="History accumulates one entry per week. Check back next week."
      />
    );
  }

  // Single-week state: a line chart with one point looks broken — show the standalone reading instead
  if (history.length === 1) {
    const only = history[0];
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-center">
        <div className="font-display text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-3">
          Tier · Wk of {only.weekStart.slice(5, 10)}
        </div>
        <div
          className="font-display font-black text-7xl leading-none mb-2"
          style={{ color: TIER_COLOR[only.tier], textShadow: `0 0 22px ${TIER_COLOR[only.tier]}66` }}
        >
          {only.tier}
        </div>
        <div className="font-mono text-xs text-zinc-400">{Math.round(only.xp).toLocaleString()} XP</div>
        <div className="text-[10px] text-zinc-500 mt-3 max-w-xs font-mono">
          History line chart will appear here once a second week is recorded.
        </div>
      </div>
    );
  }

  const data = history.map((h) => ({
    week: h.weekStart.slice(5, 10),
    tier: TIER_INDEX[h.tier],
    tierLetter: h.tier,
    xp: h.xp,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
        {/* Tier-line guides */}
        {([1, 2, 3, 4, 5, 6] as const).map((y) => (
          <ReferenceLine key={y} y={y} stroke="rgba(168,85,247,0.07)" strokeDasharray="2 4" />
        ))}
        <XAxis
          dataKey="week"
          stroke="#52525b"
          fontSize={10}
          tick={{ fontFamily: 'JetBrains Mono, monospace' }}
        />
        <YAxis
          domain={[1, 6]}
          ticks={[1, 2, 3, 4, 5, 6]}
          tickFormatter={(v) => TIER_FROM_INDEX[v] ?? ''}
          stroke="#52525b"
          fontSize={11}
          tick={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}
        />
        <Tooltip
          contentStyle={{
            background: '#0a0a0f',
            border: '1px solid rgba(168,85,247,0.4)',
            borderRadius: '8px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
          }}
          labelStyle={{ color: '#22d3ee', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}
          formatter={(_v: number, _n: string, p) => {
            const d = p.payload as { tierLetter: TierLetter; xp: number };
            return [`${d.tierLetter} · ${Math.round(d.xp).toLocaleString()} XP`, ''];
          }}
        />
        <Line
          type="monotone"
          dataKey="tier"
          stroke="#a855f7"
          strokeWidth={2}
          dot={(props: { cx?: number; cy?: number; payload?: { tierLetter: TierLetter }; index?: number }) => {
            const { cx, cy, payload, index } = props;
            const color = payload ? TIER_COLOR[payload.tierLetter] : '#22d3ee';
            return (
              <circle
                key={`rh-dot-${index ?? cx ?? ''}-${cy ?? ''}`}
                cx={cx}
                cy={cy}
                r={4}
                fill={color}
                stroke="#0a0a0f"
                strokeWidth={2}
              />
            );
          }}
          activeDot={{ r: 6, fill: '#22d3ee', stroke: '#0a0a0f', strokeWidth: 2 }}
          animationDuration={700}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center px-4">
      <svg width="36" height="36" viewBox="0 0 36 36" className="text-zinc-600 mb-3">
        <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2 4" />
        <circle cx="18" cy="18" r="6" stroke="currentColor" strokeWidth="1" fill="none" />
      </svg>
      <div className="font-display uppercase tracking-[0.25em] text-xs text-zinc-400 mb-2">{title}</div>
      <div className="text-xs text-zinc-500 font-mono max-w-xs">{body}</div>
    </div>
  );
}
