/**
 * Chart Block Component
 * Renders Recharts BarChart, LineChart, AreaChart, PieChart (donut), or stacked bar
 */

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { ChartBlockPayload } from './types';
import type { VisualBlockProps } from './types';
import { autoPalette, getPalette } from '@/lib/chart-palettes';

export function ChartBlock({ payload, className = '' }: VisualBlockProps<ChartBlockPayload>) {
  const { chartType = 'bar', data = [], title, xLabel, yLabel, colors } = payload;
  // Optional explicit paletteId on payload (set by variant picker / generator)
  const paletteId = (payload as ChartBlockPayload & { paletteId?: string }).paletteId;

  if (!data.length) return null;

  const palette = colors?.length
    ? colors
    : (paletteId ? getPalette(paletteId) : autoPalette(title || data.map((d) => d.label).join(''))).colors;
  const chartData = data.map((d) => ({ name: d.label, value: d.value }));

  const axisProps = {
    x: {
      dataKey: 'name' as const,
      tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 },
      label: xLabel ? { value: xLabel, position: 'insideBottom' as const, offset: -5, fill: 'hsl(var(--muted-foreground))' } : undefined,
    },
    y: {
      tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 },
      label: yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' as const, fill: 'hsl(var(--muted-foreground))' } : undefined,
    },
  };

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--foreground))',
  };

  const renderChart = () => {
    switch (chartType) {
      case 'donut': {
        return (
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={3}
              strokeWidth={0}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        );
      }

      case 'area': {
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis {...axisProps.x} />
            <YAxis {...axisProps.y} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={palette[0]}
              fill={palette[0]}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        );
      }

      case 'stacked_bar': {
        const total = data.reduce((s, d) => s + d.value, 0);
        return (
          <div className="flex flex-col gap-3 w-full h-full justify-center">
            <div className="flex w-full h-8 rounded-lg overflow-hidden">
              {data.map((d, i) => (
                <div
                  key={i}
                  style={{
                    width: `${(d.value / total) * 100}%`,
                    backgroundColor: palette[i % palette.length],
                  }}
                  className="transition-all"
                  title={`${d.label}: ${d.value}`}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {data.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: palette[i % palette.length] }}
                  />
                  <span className="text-[var(--deck-fg,hsl(var(--muted-foreground)))] truncate">
                    {d.label} ({Math.round((d.value / total) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'line': {
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis {...axisProps.x} />
            <YAxis {...axisProps.y} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );
      }

      default: {
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis {...axisProps.x} />
            <YAxis {...axisProps.y} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      }
    }
  };

  const needsResponsive = chartType !== 'stacked_bar';

  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <h3 className="text-fluid-xl font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">
          {title}
        </h3>
      )}
      <div className="w-full h-64">
        {needsResponsive ? (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart() as React.ReactElement}
          </ResponsiveContainer>
        ) : (
          renderChart()
        )}
      </div>
    </div>
  );
}
