/**
 * KPI Dashboard Block
 * YouExec-style 2×2 grid of metric cards with mini inline charts
 */

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KpiDashboardPayload } from './types';
import type { VisualBlockProps } from './types';

const PALETTE = ['#14b8a6', '#06b6d4', '#0ea5e9', '#6366f1', '#8b5cf6'];

function MiniChart({
  type = 'bar',
  data,
  color,
}: {
  type?: 'bar' | 'area' | 'donut';
  data: number[];
  color: string;
}) {
  const chartData = data.map((v, i) => ({ v, name: `${i}` }));

  if (type === 'donut') {
    return (
      <ResponsiveContainer width="100%" height={80}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="v"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={2}
            strokeWidth={0}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={i === 0 ? color : 'hsl(var(--muted))'} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            fill={color}
            fillOpacity={0.15}
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // default: bar
  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <Bar dataKey="v" fill={color} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function KpiDashboard({ payload, className = '' }: VisualBlockProps<KpiDashboardPayload>) {
  const { cards = [], title } = payload;
  if (!cards.length) return null;

  const TrendIcon = { up: TrendingUp, down: TrendingDown, neutral: Minus };

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-fluid-xl font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">
          {title}
        </h3>
      )}
      <div className="grid grid-cols-2 gap-4">
        {cards.slice(0, 4).map((card, i) => {
          const color = card.color || PALETTE[i % PALETTE.length];
          const Icon = card.trend ? TrendIcon[card.trend] : null;
          const trendColor =
            card.trend === 'up'
              ? 'text-emerald-500'
              : card.trend === 'down'
              ? 'text-rose-500'
              : 'text-[hsl(var(--muted-foreground))]';

          return (
            <div
              key={i}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 flex flex-col justify-between gap-2"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--deck-muted,hsl(var(--muted-foreground)))]">
                {card.title}
              </p>

              <div className="flex items-end justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span
                    className="text-3xl font-bold leading-none"
                    style={{ color }}
                  >
                    {card.value}
                  </span>
                  {card.change && (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                      {Icon && <Icon className="h-3 w-3" />}
                      {card.change}
                    </span>
                  )}
                </div>

                {card.chartData?.length ? (
                  <div className="w-20 shrink-0">
                    <MiniChart
                      type={card.chartType}
                      data={card.chartData}
                      color={color}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
