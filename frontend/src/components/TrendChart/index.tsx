import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { TrendPoint } from "@/types/api.types";
import { formatCompactCurrency } from "@/lib/format";

interface Props {
  data: TrendPoint[];
  height?: number;
  dataKey?: "revenue" | "orders" | "units_sold";
  title?: string;
}

function formatPeriod(period: string) {
  const d = new Date(period);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function TrendChart({ data, height = 200, dataKey = "revenue", title }: Props) {
  if (!data.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {title && <span className="text-label">{title}</span>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--hairline)" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="period"
            tickFormatter={formatPeriod}
            tick={{ fontSize: 11, fill: "var(--mute)", fontFamily: "Lato, sans-serif" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatCompactCurrency(v)}
            tick={{ fontSize: 11, fill: "var(--mute)", fontFamily: "Lato, sans-serif" }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            formatter={(value: number) =>
              dataKey === "revenue" ? formatCompactCurrency(value) : value.toLocaleString()
            }
            labelFormatter={formatPeriod}
            contentStyle={{
              background: "var(--canvas-elevated)",
              border: "1px solid var(--hairline)",
              borderRadius: "var(--radius-sm)",
              fontSize: 12,
              fontFamily: "Lato, sans-serif",
              boxShadow: "var(--shadow-float)",
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="var(--ink)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "var(--ink)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
