import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { useDashboardStore } from "@/stores/dashboardStore";
import type { OverviewResponse } from "@/types/api.types";
import { MetricSummary } from "@/components/MetricSummary";
import { InsightCard } from "@/components/InsightCard";
import { TrendChart } from "@/components/TrendChart";
import { BreakdownList } from "@/components/BreakdownList";
import { Topbar } from "@/app/Topbar";
import { MetricSkeleton, CardSkeleton, ErrorState } from "@/components/States";

export function OverviewPage() {
  const { period } = useDashboardStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["overview", period],
    queryFn: () => get<OverviewResponse>("/api/overview", { period }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Topbar
        title="Overview"
        subtitle={data ? `${data.period} vs ${data.prior_period}` : undefined}
      />

      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 32 }}>

        {/* Key Metrics */}
        <section>
          <p className="text-mono" style={{ marginBottom: 16 }}>Key Metrics</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <MetricSkeleton key={i} />)
            ) : isError ? (
              <ErrorState message="Failed to load metrics." onRetry={refetch} />
            ) : data ? (
              <>
                <MetricSummary label="Revenue" data={data.metrics.revenue} type="currency" priorPeriod={data.prior_period} />
                <MetricSummary label="Orders" data={data.metrics.orders} type="count" priorPeriod={data.prior_period} />
                <MetricSummary label="Customers" data={data.metrics.customers} type="count" priorPeriod={data.prior_period} />
                <MetricSummary label="Avg Order Value" data={data.metrics.aov} type="currency" priorPeriod={data.prior_period} />
                <MetricSummary label="Gross Profit" data={data.metrics.gross_profit} type="currency" priorPeriod={data.prior_period} />
                <MetricSummary label="Gross Margin" data={data.metrics.gross_margin} type="percent" priorPeriod={data.prior_period} />
              </>
            ) : null}
          </div>
        </section>

        {/* Revenue Trend */}
        {data?.revenue_trend && data.revenue_trend.length > 0 && (
          <section className="card">
            <TrendChart data={data.revenue_trend} title="Revenue Trend" height={220} />
          </section>
        )}

        {/* Intelligence Summary */}
        {(isLoading || (data?.insights && data.insights.length > 0)) && (
          <section>
            <p className="text-mono" style={{ marginBottom: 16 }}>What changed</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
              ) : (
                data?.insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))
              )}
            </div>
          </section>
        )}

        {/* Business Drivers */}
        {data && (
          <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="card">
              <BreakdownList title="Revenue by Category" items={data.top_categories} />
            </div>
            <div className="card">
              <BreakdownList title="Revenue by Country" items={data.top_countries} />
            </div>
          </section>
        )}

        {/* Anomalies */}
        {data?.anomalies && data.anomalies.length > 0 && (
          <section>
            <p className="text-mono" style={{ marginBottom: 16 }}>Anomalies Detected</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.anomalies.map((a) => (
                <div key={a.period} className="card-sm" style={{ borderLeft: `3px solid ${a.severity === "high" ? "var(--error)" : "var(--warning)"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--ink)" }}>
                        {a.period.slice(0, 7)} — {a.direction === "above" ? "Higher" : "Lower"} than usual
                      </p>
                      <p className="text-body" style={{ fontSize: "0.75rem", marginTop: 2 }}>{a.evidence}</p>
                    </div>
                    <span className={`badge ${a.severity === "high" ? "severity-high" : "severity-medium"}`} style={{ flexShrink: 0 }}>
                      {a.magnitude}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
