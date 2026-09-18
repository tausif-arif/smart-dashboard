import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCompactCurrency, formatCompactNumber, formatPercent } from "@/lib/format";
import type { MetricComparison } from "@/types/api.types";

interface Props {
  label: string;
  data: MetricComparison;
  type?: "currency" | "count" | "percent";
  suffix?: string;
  priorPeriod?: string;
}

export function MetricSummary({ label, data, type = "currency", suffix = "", priorPeriod }: Props) {
  const { current, growth_pct, direction, is_new } = data;

  const displayValue =
    type === "currency"
      ? formatCompactCurrency(current)
      : type === "percent"
      ? `${current.toFixed(1)}%`
      : formatCompactNumber(current) + suffix;

  const changeText = is_new ? "New" : formatPercent(growth_pct);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span className="text-mono">{label}</span>
      <span style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.03em" }}>
        {displayValue}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span className={`badge ${direction === "up" ? "badge-up" : direction === "down" ? "badge-down" : "badge-flat"}`}>
          {direction === "up" ? (
            <TrendingUp size={11} />
          ) : direction === "down" ? (
            <TrendingDown size={11} />
          ) : (
            <Minus size={11} />
          )}
          {changeText}
        </span>
        {priorPeriod && (
          <span className="text-caption">vs {priorPeriod}</span>
        )}
      </div>
    </div>
  );
}
