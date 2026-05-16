'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { Breakdown, TierLetter } from '@/lib/types';

const TIER_COLOR: Record<TierLetter, string> = {
  S: '#fbbf24',
  A: '#a855f7',
  B: '#22d3ee',
  C: '#7dd3fc',
  D: '#94a3b8',
  E: '#71717a',
};

/**
 * Radar / spider chart of a hunter's six contribution metrics.
 *
 * Each axis is normalized 0–100 against `orgMax` (the org-leader's value for that metric),
 * so the shape immediately answers "where does this hunter index high or low vs the top of the ladder?"
 * The translucent purple "Top hunter" silhouette behind is always at 100 on every axis — it's
 * the silhouette of whoever leads in each individual metric.
 */
export function StatRadial({
  breakdown,
  orgMax,
  tier = 'A',
}: {
  breakdown: Breakdown;
  orgMax?: Breakdown;
  tier?: TierLetter;
}) {
  // Fallback: if no org max given, scale against the user's own max so the chart still looks meaningful
  const fallback: Breakdown = {
    prsMerged: Math.max(1, breakdown.prsMerged),
    prsOpened: Math.max(1, breakdown.prsOpened),
    reviews: Math.max(1, breakdown.reviews),
    issuesClosed: Math.max(1, breakdown.issuesClosed),
    issuesOpened: Math.max(1, breakdown.issuesOpened),
    commits: Math.max(1, breakdown.commits),
    comments: Math.max(1, breakdown.comments),
  };
  const ref = orgMax ?? fallback;

  const axes: Array<{ key: keyof Breakdown; label: string; short: string }> = [
    { key: 'commits',      label: 'Commits',       short: 'CMT' },
    { key: 'prsMerged',    label: 'PRs merged',    short: 'PRm' },
    { key: 'prsOpened',    label: 'PRs opened',    short: 'PRo' },
    { key: 'reviews',      label: 'Reviews',       short: 'REV' },
    { key: 'issuesClosed', label: 'Issues closed', short: 'ISx' },
    { key: 'issuesOpened', label: 'Issues opened', short: 'ISo' },
  ];

  const data = axes.map((a) => {
    const refVal = Math.max(1, ref[a.key]);
    const userVal = breakdown[a.key];
    return {
      metric: a.short,
      label: a.label,
      raw: userVal,
      // pct of org leader (capped 100 so a fluke leader doesn't blow out the chart)
      pct: Math.min(100, Math.round((userVal / refVal) * 100)),
      ceiling: 100,
    };
  });

  const fillColor = TIER_COLOR[tier];

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(168,85,247,0.18)" strokeDasharray="2 4" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            stroke="rgba(168,85,247,0.3)"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          {/* Reference silhouette — top hunter per-metric = 100 on every axis */}
          {orgMax && (
            <Radar
              name="Top hunter"
              dataKey="ceiling"
              stroke="rgba(168, 85, 247, 0.35)"
              fill="rgba(168, 85, 247, 0.06)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}
          {/* This hunter's actual profile */}
          <Radar
            name="This hunter"
            dataKey="pct"
            stroke={fillColor}
            fill={fillColor}
            fillOpacity={0.32}
            strokeWidth={1.6}
            animationDuration={800}
          />
          <Tooltip
            contentStyle={{
              background: '#0a0a0f',
              border: '1px solid rgba(168,85,247,0.4)',
              borderRadius: '8px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
            }}
            formatter={(_value: number, _name: string, props) => {
              const p = props.payload as { label: string; raw: number; pct: number };
              return [`${p.raw.toLocaleString()} (${p.pct}% of top)`, p.label];
            }}
            labelFormatter={() => ''}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-4 text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm" style={{ background: fillColor }} />
          This hunter
        </span>
        {orgMax && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm border border-neon-purple/60 border-dashed" />
            Top of ladder
          </span>
        )}
      </div>
    </div>
  );
}
