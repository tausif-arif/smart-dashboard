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
    <div className="flex-1 flex flex-col min-w-0 bg-canvas">
      <Topbar title="Data Status" subtitle="Database health and data coverage" />

      <div className="flex flex-col gap-6 p-4 md:p-8 max-w-3xl overflow-y-auto">
        {isLoading ? (
          <p className="text-body-sm text-mute">Checking data status…</p>
        ) : isError ? (
          <ErrorState message="Failed to connect to the database." onRetry={refetch} />
        ) : data ? (
          <>
            {/* Status Banner */}
            <div className={`feature-card p-4 flex items-center gap-3 border-l-4 ${data.is_stale ? "border-l-warning" : "border-l-success"}`}>
              {data.is_stale ? <AlertCircle size={20} className="text-warning shrink-0" /> : <CheckCircle size={20} className="text-success shrink-0" />}
              <div>
                <p className="text-body-md font-bold text-ink m-0">
                  {data.is_stale ? "Data may be stale" : "Data is current"}
                </p>
                <p className="text-body-sm text-mute m-0 mt-0.5">
                  Last checked: {new Date(data.last_checked).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Sales date range */}
            {data.sales_date_range?.min && (
              <div className="feature-card p-4">
                <span className="text-mono-eyebrow">Sales Data Coverage</span>
                <p className="text-body-md text-body mt-2">
                  {data.sales_date_range.min} — {data.sales_date_range.max}
                </p>
              </div>
            )}

            {/* Table counts */}
            <div>
              <h2 className="text-mono-eyebrow mb-3">Table Row Counts</h2>
              <div className="flex flex-col border border-hairline rounded-md overflow-hidden bg-canvas-elevated">
                {data.tables.map((t, i) => (
                  <div key={t.table} className={`flex items-center justify-between p-3 md:px-4 md:py-3 ${i < data.tables.length - 1 ? "border-b border-hairline" : ""}`}>
                    <div className="flex items-center gap-2">
                      <Database size={14} className="text-mute" />
                      <span className="text-body-sm font-mono text-ink">
                        {t.table}
                      </span>
                    </div>
                    <span className="text-body-sm font-bold text-body">
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
