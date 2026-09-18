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
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <span className="text-label">{title}</span>
      {items.map((item) => (
        <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--ink)", fontWeight: 400 }}>{item.label}</span>
            <span style={{ fontSize: "0.8rem", color: "var(--ink)", fontWeight: 700 }}>
              {formatCompactCurrency(item.revenue)}
              <span style={{ fontWeight: 400, color: "var(--mute)", marginLeft: 4 }}>
                {item.share_pct.toFixed(1)}%
              </span>
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: 4, background: "var(--hairline)", borderRadius: "var(--radius-full)" }}>
            <div
              style={{
                height: "100%",
                borderRadius: "var(--radius-full)",
                background: "var(--ink)",
                width: `${(item.revenue / maxRevenue) * 100}%`,
                transition: "width 0.4s ease",
              }}
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
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span className="text-label">{title}</span>
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 0",
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "var(--body)" }}>{item.label}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: item.direction === "up" ? "#16a34a" : "#dc2626" }}>
              {formatCompactCurrency(Math.abs(item.change))} {item.direction === "up" ? "+" : "−"}
            </span>
            <span className={`badge ${item.direction === "up" ? "badge-up" : "badge-down"}`}>
              {item.direction === "up" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {item.change_pct !== null ? `${Math.abs(item.change_pct).toFixed(1)}%` : "New"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
