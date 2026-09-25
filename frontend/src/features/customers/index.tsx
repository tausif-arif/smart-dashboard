import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { useDashboardStore } from "@/stores/dashboardStore";
import type { CustomersResponse } from "@/types/api.types";
import { MetricSummary } from "@/components/MetricSummary";
import { BreakdownList } from "@/components/BreakdownList";
import { Topbar } from "@/app/Topbar";
import { MetricSkeleton, ErrorState } from "@/components/States";
import { formatCompactCurrency, formatNumber } from "@/lib/format";
import { TrendingUp, TrendingDown } from "lucide-react";

export function CustomersPage() {
  const { period } = useDashboardStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["customers", period],
    queryFn: () => get<CustomersResponse>("/api/customers", { period }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-canvas">
      <Topbar
        title="Customers"
        subtitle={data ? `${data.period} vs ${data.prior_period}` : undefined}
      />

      <div className="flex flex-col gap-8 p-4 md:p-8 overflow-y-auto">
        {/* Volume Metrics */}
        <section>
          <h2 className="text-mono-eyebrow mb-4">Volume</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <MetricSkeleton key={i} />)
            ) : isError ? (
              <ErrorState message="Failed to load customer data." onRetry={refetch} />
            ) : data ? (
              <>
                <MetricSummary label="Customers" data={data.metrics.customers} type="count" priorPeriod={data.prior_period} />
                <MetricSummary label="Revenue" data={data.metrics.revenue} type="currency" priorPeriod={data.prior_period} />
                <MetricSummary label="Avg Order Value" data={data.metrics.aov} type="currency" priorPeriod={data.prior_period} />
              </>
            ) : null}
          </div>
        </section>

        {/* Behavior Summary */}
        {data?.behavior && (
          <section>
            <h2 className="text-mono-eyebrow mb-4">Behavior</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Repeat Rate */}
              <div className="feature-card p-4">
                <span className="text-mono-eyebrow text-[10px]">Repeat Purchase Rate</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-heading-lg">{data.behavior.repeat_rate_pct.toFixed(1)}%</span>
                  {data.repeat_rate_change !== null && (
                    <span className={`text-label-sm flex items-center ${data.repeat_rate_change >= 0 ? "text-success" : "text-error"}`}>
                      {data.repeat_rate_change >= 0 ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                      {data.repeat_rate_change >= 0 ? "+" : ""}{data.repeat_rate_change.toFixed(1)}pp
                    </span>
                  )}
                </div>
                <p className="text-body-sm mt-1">
                  {data.behavior.repeat_customers.toLocaleString()} of {data.behavior.total_customers.toLocaleString()} customers
                </p>
              </div>

              {/* Avg Orders */}
              <div className="feature-card p-4">
                <span className="text-mono-eyebrow text-[10px]">Avg Orders per Customer</span>
                <span className="text-heading-lg block mt-2">
                  {data.behavior.avg_orders_per_customer.toFixed(1)}
                </span>
              </div>

              {/* Single Order */}
              <div className="feature-card p-4">
                <span className="text-mono-eyebrow text-[10px]">Single-Order Customers</span>
                <span className="text-heading-lg block mt-2">
                  {formatNumber(data.behavior.single_order_customers)}
                </span>
                <p className="text-body-sm mt-1">
                  {((data.behavior.single_order_customers / data.behavior.total_customers) * 100).toFixed(1)}% of total
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Top Customers */}
        {data?.behavior?.top_customers && (
          <section className="feature-card p-4 overflow-x-auto">
            <h2 className="text-mono-eyebrow mb-4">Top Customers by Revenue</h2>
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-hairline">
                  {["Name", "Country", "Revenue", "Orders"].map((h) => (
                    <th key={h} className="pb-2 text-mono-eyebrow">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-body-sm">
                {data.behavior.top_customers.map((c) => (
                  <tr key={c.customerkey} className="border-b border-hairline-soft">
                    <td className="py-2 text-ink pr-4">{c.name}</td>
                    <td className="py-2 text-body pr-4">{c.country}</td>
                    <td className="py-2 text-ink font-medium pr-4">{formatCompactCurrency(c.revenue)}</td>
                    <td className="py-2 text-body pr-4">{c.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Geographic breakdown */}
        {data && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="feature-card p-4"><BreakdownList title="Revenue by Customer Country" items={data.by_country} /></div>
            <div className="feature-card p-4"><BreakdownList title="Revenue by Continent" items={data.by_continent} /></div>
          </section>
        )}
      </div>
    </div>
  );
}
