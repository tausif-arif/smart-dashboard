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
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Topbar
        title="Products"
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
          <section className="card">
            <p className="text-label" style={{ marginBottom: 16 }}>Top Products by Revenue</p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
                  {["Product", "Revenue", "Orders", "Units", "Share"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: "var(--mute)", fontWeight: 700, fontSize: "0.7rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.top_products.map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
                    <td style={{ padding: "8px", color: "var(--ink)", fontWeight: 400, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.label}</td>
                    <td style={{ padding: "8px", fontWeight: 700 }}>{formatCompactCurrency(p.revenue)}</td>
                    <td style={{ padding: "8px", color: "var(--body)" }}>{p.orders.toLocaleString()}</td>
                    <td style={{ padding: "8px", color: "var(--body)" }}>{p.units_sold.toLocaleString()}</td>
                    <td style={{ padding: "8px", color: "var(--mute)" }}>{p.share_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Category & Brand breakdown */}
        {data && (
          <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="card"><BreakdownList title="By Category" items={data.by_category} /></div>
            <div className="card"><BreakdownList title="By Brand" items={data.by_brand} /></div>
          </section>
        )}

        {/* Period contributors */}
        {data?.period_contributors && data.period_contributors.length > 0 && (
          <div className="card">
            <DriverList title="Category Change vs Prior Period" items={data.period_contributors} />
          </div>
        )}
      </div>
    </div>
  );
}
