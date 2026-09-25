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

const TYPE_STYLE: Record<string, string> = {
  anomaly: "bg-warning-soft text-warning-deep",
  decline: "bg-error-soft text-error-deep",
  growth: "bg-success-soft text-success",
  opportunity: "bg-link-soft text-link-deep",
  risk: "bg-error-soft text-error-deep",
  unusual_behavior: "bg-warning-soft text-warning-deep",
  trend_change: "bg-violet/10 text-violet",
};

export function InsightCard({ insight }: Props) {
  const styleClass = TYPE_STYLE[insight.type] ?? TYPE_STYLE.anomaly;

  return (
    <div className="feature-card p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <span
          className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-[11px] font-bold gap-1 shrink-0 ${styleClass}`}
        >
          {ICON_MAP[insight.type]}
          {insight.type.replace(/_/g, " ")}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center ${insight.severity === "high" ? "bg-error-soft text-error-deep" : insight.severity === "medium" ? "bg-warning-soft text-warning-deep" : "bg-hairline text-body"}`}
        >
          {insight.severity}
        </span>
        {insight.change_pct !== null && (
          <span className={`ml-auto px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center ${insight.change_pct < 0 ? "bg-error-soft text-error" : "bg-success-soft text-success"}`}>
            {formatPercent(insight.change_pct)}
          </span>
        )}
      </div>

      {/* Title */}
      <p className="font-bold text-ink text-sm leading-snug m-0">
        {insight.title}
      </p>

      {/* Explanation */}
      <p className="text-body-sm text-body m-0">
        {insight.explanation}
      </p>

      {/* Evidence */}
      {insight.evidence && (
        <div className="bg-hairline-soft border border-hairline rounded-sm px-2.5 py-2">
          <span className="block text-mono-eyebrow text-[10px] mb-0.5">Evidence</span>
          <span className="text-[12px] text-body">{insight.evidence}</span>
        </div>
      )}

      {/* Actions */}
      {insight.actions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {insight.actions.map((action) => (
            <button key={action} className="text-[12px] font-medium text-link hover:text-link-deep bg-transparent border border-link-soft hover:bg-link-soft px-2 py-1 rounded-sm transition-colors cursor-pointer">
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
