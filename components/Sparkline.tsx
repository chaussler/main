"use client";

import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import type { MetricPoint } from "@/lib/types";

export function Sparkline({ data, tone = "accent" }: { data?: MetricPoint[]; tone?: "accent" | "good" | "bad" | "muted" }) {
  if (!data || data.length < 2) return <div className="h-full w-full" />;
  const color = tone === "good" ? "#34d399" : tone === "bad" ? "#f87171" : tone === "muted" ? "#6b7280" : "#5b8def";
  const id = `spark-${tone}`;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.15 || 1;

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[min - pad, max + pad]} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.75} fill={`url(#${id})`} isAnimationActive={false} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
