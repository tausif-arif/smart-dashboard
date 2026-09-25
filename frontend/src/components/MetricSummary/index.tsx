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
    <div className="feature-card p-4 flex flex-col gap-2">
      <span className="text-mono-eyebrow">{label}</span>
      <span className="text-heading-xl tracking-tight text-ink">
        {displayValue}
      </span>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 ${
          direction === "up" ? "bg-success-soft text-success" : 
          direction === "down" ? "bg-error-soft text-error" : 
          "bg-hairline text-body"
        }`}>
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
          <span className="text-body-sm text-mute">vs {priorPeriod}</span>
        )}
      </div>
    </div>
  );
}
