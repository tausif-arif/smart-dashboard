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
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Topbar
        title="Customers"
        subtitle={data ? `${data.period} vs ${data.prior_period}` : undefined}
      />

      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Volume Metrics */}
        <section>
          <p className="text-mono" style={{ marginBottom: 16 }}>Volume</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
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
            <p className="text-mono" style={{ marginBottom: 16 }}>Behavior</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {/* Repeat Rate */}
              <div className="card">
                <span className="text-mono">Repeat Purchase Rate</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--ink)" }}>
                    {data.behavior.repeat_rate_pct.toFixed(1)}%
                  </span>
                  {data.repeat_rate_change !== null && (
                    <span style={{ fontSize: "0.8rem", color: data.repeat_rate_change >= 0 ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                      {data.repeat_rate_change >= 0 ? <TrendingUp size={12} style={{ display: "inline" }} /> : <TrendingDown size={12} style={{ display: "inline" }} />}
                      {data.repeat_rate_change >= 0 ? "+" : ""}{data.repeat_rate_change.toFixed(1)}pp
                    </span>
                  )}
                </div>
                <p className="text-caption" style={{ marginTop: 4 }}>
                  {data.behavior.repeat_customers.toLocaleString()} of {data.behavior.total_customers.toLocaleString()} customers
                </p>
              </div>

              {/* Avg Orders */}
              <div className="card">
                <span className="text-mono">Avg Orders per Customer</span>
                <span style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--ink)", display: "block", marginTop: 6 }}>
                  {data.behavior.avg_orders_per_customer.toFixed(1)}
                </span>
              </div>

              {/* Single Order */}
              <div className="card">
                <span className="text-mono">Single-Order Customers</span>
                <span style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--ink)", display: "block", marginTop: 6 }}>
                  {formatNumber(data.behavior.single_order_customers)}
                </span>
                <p className="text-caption" style={{ marginTop: 4 }}>
                  {((data.behavior.single_order_customers / data.behavior.total_customers) * 100).toFixed(1)}% of total
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Top Customers */}
        {data?.behavior?.top_customers && (
          <section className="card">
            <p className="text-label" style={{ marginBottom: 16 }}>Top Customers by Revenue</p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
                  {["Name", "Country", "Revenue", "Orders"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: "var(--mute)", fontWeight: 700, fontSize: "0.7rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.behavior.top_customers.map((c) => (
                  <tr key={c.customerkey} style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
                    <td style={{ padding: "8px", color: "var(--ink)", fontWeight: 400 }}>{c.name}</td>
                    <td style={{ padding: "8px", color: "var(--body)" }}>{c.country}</td>
                    <td style={{ padding: "8px", fontWeight: 700 }}>{formatCompactCurrency(c.revenue)}</td>
                    <td style={{ padding: "8px", color: "var(--body)" }}>{c.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Geographic breakdown */}
        {data && (
          <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="card"><BreakdownList title="Revenue by Customer Country" items={data.by_country} /></div>
            <div className="card"><BreakdownList title="Revenue by Continent" items={data.by_continent} /></div>
          </section>
        )}
      </div>
    </div>
  );
}
