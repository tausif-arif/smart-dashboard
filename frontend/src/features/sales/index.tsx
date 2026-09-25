import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { useDashboardStore } from "@/stores/dashboardStore";
import type { SalesResponse } from "@/types/api.types";
import { MetricSummary } from "@/components/MetricSummary";
import { TrendChart } from "@/components/TrendChart";
import { BreakdownList, DriverList } from "@/components/BreakdownList";
import { Topbar } from "@/app/Topbar";
import { MetricSkeleton, ErrorState } from "@/components/States";

export function SalesPage() {
  const { period } = useDashboardStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["sales", period],
    queryFn: () => get<SalesResponse>("/api/sales", { period }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-canvas">
      <Topbar
        title="Sales"
        subtitle={data ? `${data.period} vs ${data.prior_period}` : undefined}
      />

      <div className="flex flex-col gap-8 p-4 md:p-8 overflow-y-auto">

        {/* Metrics */}
        <section>
          <h2 className="text-mono-eyebrow mb-4">Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
            ) : isError ? (
              <ErrorState message="Failed to load sales data." onRetry={refetch} />
            ) : data ? (
              <>
                <MetricSummary label="Revenue" data={data.metrics.revenue} type="currency" priorPeriod={data.prior_period} />
                <MetricSummary label="Orders" data={data.metrics.orders} type="count" priorPeriod={data.prior_period} />
                <MetricSummary label="Units Sold" data={data.metrics.units_sold} type="count" priorPeriod={data.prior_period} />
                <MetricSummary label="Avg Order Value" data={data.metrics.aov} type="currency" priorPeriod={data.prior_period} />
              </>
            ) : null}
          </div>
        </section>

        {/* Trend */}
        {data?.trend && (
          <section className="feature-card p-4">
            <TrendChart data={data.trend} title="Revenue Over Time" height={220} />
          </section>
        )}

        {/* Drivers */}
        {data && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="feature-card p-4">
              <DriverList title="Category Contributors vs Prior Period" items={data.category_drivers} />
            </div>
            <div className="feature-card p-4">
              <DriverList title="Country Contributors vs Prior Period" items={data.country_drivers} />
            </div>
          </section>
        )}

        {/* Breakdown */}
        {data && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="feature-card p-4"><BreakdownList title="By Category" items={data.by_category} /></div>
            <div className="feature-card p-4"><BreakdownList title="By Country" items={data.by_country} /></div>
            <div className="feature-card p-4"><BreakdownList title="By Brand" items={data.by_brand} /></div>
          </section>
        )}
      </div>
    </div>
  );
}
