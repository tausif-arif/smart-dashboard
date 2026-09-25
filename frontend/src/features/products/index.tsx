import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { useDashboardStore } from "@/stores/dashboardStore";
import type { ProductsResponse } from "@/types/api.types";
import { MetricSummary } from "@/components/MetricSummary";
import { BreakdownList, DriverList } from "@/components/BreakdownList";
import { Topbar } from "@/app/Topbar";
import { MetricSkeleton, ErrorState } from "@/components/States";
import { formatCompactCurrency, formatPercent } from "@/lib/format";

export function ProductsPage() {
  const { period } = useDashboardStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", period],
    queryFn: () => get<ProductsResponse>("/api/products", { period }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-canvas">
      <Topbar
        title="Products"
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
              <ErrorState message="Failed to load product data." onRetry={refetch} />
            ) : data ? (
              <>
                <MetricSummary label="Revenue" data={data.metrics.revenue} type="currency" priorPeriod={data.prior_period} />
                <MetricSummary label="Orders" data={data.metrics.orders} type="count" priorPeriod={data.prior_period} />
                <MetricSummary label="Units Sold" data={data.metrics.units_sold} type="count" priorPeriod={data.prior_period} />
                <MetricSummary label="Gross Margin" data={data.metrics.gross_margin} type="percent" priorPeriod={data.prior_period} />
              </>
            ) : null}
          </div>
        </section>

        {/* Top Products Table */}
        {data?.top_products && (
          <section className="feature-card p-4 overflow-x-auto">
            <h2 className="text-mono-eyebrow mb-4">Top Products by Revenue</h2>
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-hairline">
                  {["Product", "Revenue", "Orders", "Units", "Share"].map((h) => (
                    <th key={h} className="pb-2 text-mono-eyebrow">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-body-sm">
                {data.top_products.map((p, i) => (
                  <tr key={i} className="border-b border-hairline-soft">
                    <td className="py-2 text-ink max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap pr-4">{p.label}</td>
                    <td className="py-2 text-ink font-medium pr-4">{formatCompactCurrency(p.revenue)}</td>
                    <td className="py-2 text-body pr-4">{p.orders.toLocaleString()}</td>
                    <td className="py-2 text-body pr-4">{p.units_sold.toLocaleString()}</td>
                    <td className="py-2 text-mute pr-4">{p.share_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Category & Brand breakdown */}
        {data && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="feature-card p-4"><BreakdownList title="By Category" items={data.by_category} /></div>
            <div className="feature-card p-4"><BreakdownList title="By Brand" items={data.by_brand} /></div>
          </section>
        )}

        {/* Period contributors */}
        {data?.period_contributors && data.period_contributors.length > 0 && (
          <div className="feature-card p-4">
            <DriverList title="Category Change vs Prior Period" items={data.period_contributors} />
          </div>
        )}
      </div>
    </div>
  );
}
