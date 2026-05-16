'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { Breakdown } from '@/lib/types';

/**
 * Two hunters' stat profiles overlaid on the same radar.
 * Each axis is normalized 0–100 against the max of (a, b, orgMax) on that metric,
 * so both shapes share the same scale and you can read who-dominates-where at a glance.
 */
export function CompareRadar({
  a, b, labelA, labelB, colorA = '#a855f7', colorB = '#22d3ee', orgMax,
}: {
  a: Breakdown;
  b: Breakdown;
  labelA: string;
  labelB: string;
  colorA?: string;
  colorB?: string;
  orgMax?: Breakdown;
}) {
  const axes: Array<{ key: keyof Breakdown; short: string; label: string }> = [
    { key: 'commits',      short: 'CMT', label: 'Commits' },
    { key: 'prsMerged',    short: 'PRm', label: 'PRs merged' },
    { key: 'prsOpened',    short: 'PRo', label: 'PRs opened' },
    { key: 'reviews',      short: 'REV', label: 'Reviews' },
    { key: 'issuesClosed', short: 'ISx', label: 'Issues closed' },
    { key: 'issuesOpened', short: 'ISo', label: 'Issues opened' },
  ];

  const data = axes.map((ax) => {
    const scale = Math.max(1, orgMax?.[ax.key] ?? Math.max(a[ax.key], b[ax.key]));
    return {
      metric: ax.short,
      label: ax.label,
      [labelA]: Math.min(100, Math.round((a[ax.key] / scale) * 100)),
      [labelB]: Math.min(100, Math.round((b[ax.key] / scale) * 100)),
      rawA: a[ax.key],
      rawB: b[ax.key],
    };
  });

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(168,85,247,0.18)" strokeDasharray="2 4" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            stroke="rgba(168,85,247,0.3)"
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name={labelA}
            dataKey={labelA}
            stroke={colorA}
            fill={colorA}
            fillOpacity={0.28}
            strokeWidth={1.6}
            animationDuration={700}
          />
          <Radar
            name={labelB}
            dataKey={labelB}
            stroke={colorB}
            fill={colorB}
            fillOpacity={0.28}
            strokeWidth={1.6}
            animationDuration={700}
          />
          <Tooltip
            contentStyle={{
              background: '#0a0a0f',
              border: '1px solid rgba(168,85,247,0.4)',
              borderRadius: '8px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
            }}
            formatter={(_v: number, name: string, props) => {
              const d = props.payload as { label: string; rawA: number; rawB: number };
              const raw = name === labelA ? d.rawA : d.rawB;
              return [raw.toLocaleString(), `${name} · ${d.label}`];
            }}
            labelFormatter={() => ''}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 text-[10px] font-mono uppercase tracking-widest text-zinc-400 mt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: colorA }} />
          <span style={{ color: colorA }}>{labelA}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: colorB }} />
          <span style={{ color: colorB }}>{labelB}</span>
        </span>
      </div>
    </div>
  );
}
