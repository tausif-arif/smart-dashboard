import { useDashboardStore } from "@/stores/dashboardStore";
import { BRAND_CONFIG } from "@/config/brand";
import type { Period } from "@/types/api.types";
import { periodLabel } from "@/lib/format";

const PERIODS: Period[] = [
  "this_month", "last_month", "this_quarter", "last_quarter", "this_year", "last_year",
];

interface Props {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: Props) {
  const { period, setPeriod } = useDashboardStore();

  return (
    <div style={{
      borderBottom: "1px solid var(--hairline)",
      padding: "16px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "var(--canvas-elevated)",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      <div>
        <h1 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.01em" }}>
          {title}
        </h1>
        {subtitle && <p className="text-caption">{subtitle}</p>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          style={{
            border: "1px solid var(--hairline)",
            borderRadius: "var(--radius-sm)",
            padding: "5px 10px",
            fontSize: "0.8rem",
            color: "var(--ink)",
            background: "var(--canvas-elevated)",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            outline: "none",
          }}
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>{periodLabel(p)}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
