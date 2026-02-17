/**
 * Chart Block Component
 * Renders Recharts BarChart or LineChart from numeric data
 */

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { ChartBlockPayload } from './types';
import type { VisualBlockProps } from './types';

export function ChartBlock({ payload, className = '' }: VisualBlockProps<ChartBlockPayload>) {
  const { chartType = 'bar', data = [], title, xLabel, yLabel } = payload;

  if (!data.length) return null;

  const chartData = data.map((d) => ({ name: d.label, value: d.value }));

  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <h3 className="text-fluid-xl font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">
          {title}
        </h3>
      )}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' } : undefined}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' } : undefined}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' } : undefined}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' } : undefined}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
