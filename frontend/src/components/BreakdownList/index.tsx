import type { BreakdownItem, ContributorItem } from "@/types/api.types";
import { formatCompactCurrency, formatPercent } from "@/lib/format";
import { TrendingUp, TrendingDown } from "lucide-react";

// ─── Breakdown List ──────────────────────────────────────────────────────────

interface BreakdownProps {
  title: string;
  items: BreakdownItem[];
}

export function BreakdownList({ title, items }: BreakdownProps) {
  if (!items.length) return null;
  const maxRevenue = items[0].revenue;

  return (
    <div className="flex flex-col gap-3">
      <span className="text-mono-eyebrow">{title}</span>
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-[13px] text-ink">{item.label}</span>
            <span className="text-[13px] text-ink font-bold">
              {formatCompactCurrency(item.revenue)}
              <span className="font-normal text-mute ml-1">
                {item.share_pct.toFixed(1)}%
              </span>
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-hairline rounded-full overflow-hidden">
            <div
              className="h-full bg-ink rounded-full transition-all duration-400 ease-in-out"
              style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Driver List (period-over-period contributors) ───────────────────────────

interface DriverProps {
  title: string;
  items: ContributorItem[];
}

export function DriverList({ title, items }: DriverProps) {
  if (!items.length) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-mono-eyebrow">{title}</span>
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`flex items-center justify-between py-2 ${index < items.length - 1 ? "border-b border-hairline" : ""}`}
        >
          <span className="text-[13px] text-body">{item.label}</span>
          <div className="flex items-center gap-2">
            <span className={`text-[13px] font-bold ${item.direction === "up" ? "text-success" : "text-error"}`}>
              {formatCompactCurrency(Math.abs(item.change))} {item.direction === "up" ? "+" : "−"}
            </span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-0.5 ${item.direction === "up" ? "bg-success-soft text-success" : "bg-error-soft text-error"}`}>
              {item.direction === "up" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {item.change_pct !== null ? `${Math.abs(item.change_pct).toFixed(1)}%` : "New"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
