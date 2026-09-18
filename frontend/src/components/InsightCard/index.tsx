import { AlertTriangle, TrendingDown, TrendingUp, Lightbulb, AlertCircle } from "lucide-react";
import type { InsightCard as InsightCardType } from "@/types/api.types";
import { formatPercent } from "@/lib/format";

interface Props {
  insight: InsightCardType;
}

const ICON_MAP = {
  anomaly: <AlertTriangle size={14} />,
  decline: <TrendingDown size={14} />,
  growth: <TrendingUp size={14} />,
  opportunity: <Lightbulb size={14} />,
  risk: <AlertCircle size={14} />,
  unusual_behavior: <AlertTriangle size={14} />,
  trend_change: <TrendingDown size={14} />,
};

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  anomaly: { bg: "#fef3c7", color: "#92400e" },
  decline: { bg: "#fee2e2", color: "#b91c1c" },
  growth: { bg: "#dcfce7", color: "#166534" },
  opportunity: { bg: "#dbeafe", color: "#1e40af" },
  risk: { bg: "#fee2e2", color: "#b91c1c" },
  unusual_behavior: { bg: "#fef3c7", color: "#92400e" },
  trend_change: { bg: "#f3e8ff", color: "#6b21a8" },
};

export function InsightCard({ insight }: Props) {
  const style = TYPE_STYLE[insight.type] ?? TYPE_STYLE.anomaly;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px 8px",
            borderRadius: "var(--radius-full)",
            background: style.bg,
            color: style.color,
            fontSize: 11,
            fontWeight: 700,
            gap: 4,
            flexShrink: 0,
          }}
        >
          {ICON_MAP[insight.type]}
          {insight.type.replace(/_/g, " ")}
        </span>
        <span
          className={`badge ${insight.severity === "high" ? "badge-down" : insight.severity === "medium" ? "" : "badge-flat"}`}
          style={insight.severity === "medium" ? { background: "#fef3c7", color: "#92400e" } : {}}
        >
          {insight.severity}
        </span>
        {insight.change_pct !== null && (
          <span className={`badge ${insight.change_pct < 0 ? "badge-down" : "badge-up"}`} style={{ marginLeft: "auto" }}>
            {formatPercent(insight.change_pct)}
          </span>
        )}
      </div>

      {/* Title */}
      <p style={{ fontWeight: 700, color: "var(--ink)", fontSize: "0.9rem", lineHeight: 1.3 }}>
        {insight.title}
      </p>

      {/* Explanation */}
      <p className="text-body" style={{ fontSize: "0.8rem" }}>
        {insight.explanation}
      </p>

      {/* Evidence */}
      {insight.evidence && (
        <div style={{
          background: "var(--hairline-soft)",
          border: "1px solid var(--hairline)",
          borderRadius: "var(--radius-sm)",
          padding: "8px 10px",
        }}>
          <span className="text-mono" style={{ display: "block", marginBottom: 2 }}>Evidence</span>
          <span style={{ fontSize: "0.75rem", color: "var(--body)" }}>{insight.evidence}</span>
        </div>
      )}

      {/* Actions */}
      {insight.actions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {insight.actions.map((action) => (
            <button key={action} className="btn-ghost btn" style={{ fontSize: "0.75rem", height: 26, padding: "0 8px" }}>
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
