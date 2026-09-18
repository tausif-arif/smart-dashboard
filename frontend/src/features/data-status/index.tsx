import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import type { DataStatusResponse } from "@/types/api.types";
import { Topbar } from "@/app/Topbar";
import { ErrorState } from "@/components/States";
import { CheckCircle, AlertCircle, Database } from "lucide-react";

export function DataStatusPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["data-status"],
    queryFn: () => get<DataStatusResponse>("/api/data-status"),
    staleTime: 60 * 1000,
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Topbar title="Data Status" subtitle="Database health and data coverage" />

      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 700 }}>
        {isLoading ? (
          <p className="text-caption">Checking data status…</p>
        ) : isError ? (
          <ErrorState message="Failed to connect to the database." onRetry={refetch} />
        ) : data ? (
          <>
            {/* Status Banner */}
            <div className="card-sm" style={{ display: "flex", alignItems: "center", gap: 10, borderLeft: `3px solid ${data.is_stale ? "var(--warning)" : "#16a34a"}` }}>
              {data.is_stale ? <AlertCircle size={16} color="var(--warning)" /> : <CheckCircle size={16} color="#16a34a" />}
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--ink)" }}>
                  {data.is_stale ? "Data may be stale" : "Data is current"}
                </p>
                <p className="text-caption">
                  Last checked: {new Date(data.last_checked).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Sales date range */}
            {data.sales_date_range?.min && (
              <div className="card-sm">
                <span className="text-mono">Sales Data Coverage</span>
                <p style={{ marginTop: 6, fontSize: "0.875rem", color: "var(--body)" }}>
                  {data.sales_date_range.min} — {data.sales_date_range.max}
                </p>
              </div>
            )}

            {/* Table counts */}
            <div>
              <p className="text-mono" style={{ marginBottom: 12 }}>Table Row Counts</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--hairline)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                {data.tables.map((t, i) => (
                  <div key={t.table} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderBottom: i < data.tables.length - 1 ? "1px solid var(--hairline)" : "none",
                    background: "var(--canvas-elevated)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Database size={14} color="var(--mute)" />
                      <span style={{ fontSize: "0.875rem", color: "var(--ink)", fontFamily: "var(--font-mono)" }}>
                        {t.table}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--body)" }}>
                      {t.row_count.toLocaleString()} rows
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
