'use client';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { Breakdown } from '@/lib/types';

export function StatRadial({ breakdown }: { breakdown: Breakdown }) {
  const data = [
    { name: 'PRs merged', value: breakdown.prsMerged, fill: '#fbbf24' },
    { name: 'Commits', value: breakdown.commits, fill: '#a855f7' },
    { name: 'Reviews', value: breakdown.reviews, fill: '#22d3ee' },
    { name: 'Issues closed', value: breakdown.issuesClosed, fill: '#7dd3fc' },
  ];
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadialBarChart innerRadius="30%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
        <PolarAngleAxis type="number" domain={[0, max]} tick={false} />
        <RadialBar background dataKey="value" cornerRadius={6} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
