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
    <div className="flex-1 flex flex-col min-w-0 bg-canvas">
      <Topbar
        title="Overview"
        subtitle={data ? `${data.period} vs ${data.prior_period}` : undefined}
      />

      <div className="flex flex-col gap-8 p-4 md:p-8 overflow-y-auto">

        {/* Key Metrics */}
        <section>
          <h2 className="text-mono-eyebrow mb-4">Key Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
          <section className="feature-card p-4">
            <TrendChart data={data.revenue_trend} title="Revenue Trend" height={220} />
          </section>
        )}

        {/* Intelligence Summary */}
        {(isLoading || (data?.insights && data.insights.length > 0)) && (
          <section>
            <h2 className="text-mono-eyebrow mb-4">What changed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="feature-card p-4">
              <BreakdownList title="Revenue by Category" items={data.top_categories} />
            </div>
            <div className="feature-card p-4">
              <BreakdownList title="Revenue by Country" items={data.top_countries} />
            </div>
          </section>
        )}

        {/* Anomalies */}
        {data?.anomalies && data.anomalies.length > 0 && (
          <section>
            <h2 className="text-mono-eyebrow mb-4">Anomalies Detected</h2>
            <div className="flex flex-col gap-2">
              {data.anomalies.map((a) => (
                <div key={a.period} className={`feature-card p-3 border-l-4 ${a.severity === "high" ? "border-l-error" : "border-l-warning"}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-label-sm m-0">
                        {a.period.slice(0, 7)} — {a.direction === "above" ? "Higher" : "Lower"} than usual
                      </p>
                      <p className="text-body-sm mt-1">{a.evidence}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-medium tracking-wide uppercase shrink-0 ${a.severity === "high" ? "bg-error-soft text-error-deep" : "bg-warning-soft text-warning-deep"}`}>
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
