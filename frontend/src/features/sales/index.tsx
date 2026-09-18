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
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Topbar
        title="Sales"
        subtitle={data ? `${data.period} vs ${data.prior_period}` : undefined}
      />

      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 32 }}>

        {/* Metrics */}
        <section>
          <p className="text-mono" style={{ marginBottom: 16 }}>Performance</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
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
        {data?.trend && <div className="card"><TrendChart data={data.trend} title="Revenue Over Time" height={220} /></div>}

        {/* Drivers */}
        {data && (
          <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="card">
              <DriverList title="Category Contributors vs Prior Period" items={data.category_drivers} />
            </div>
            <div className="card">
              <DriverList title="Country Contributors vs Prior Period" items={data.country_drivers} />
            </div>
          </section>
        )}

        {/* Breakdown */}
        {data && (
          <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div className="card"><BreakdownList title="By Category" items={data.by_category} /></div>
            <div className="card"><BreakdownList title="By Country" items={data.by_country} /></div>
            <div className="card"><BreakdownList title="By Brand" items={data.by_brand} /></div>
          </section>
        )}
      </div>
    </div>
  );
}
