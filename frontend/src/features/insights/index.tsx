import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { useDashboardStore } from "@/stores/dashboardStore";
import type { InsightsResponse } from "@/types/api.types";
import { InsightCard } from "@/components/InsightCard";
import { Topbar } from "@/app/Topbar";
import { CardSkeleton, ErrorState, EmptyState } from "@/components/States";

export function InsightsPage() {
  const { period } = useDashboardStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["insights", period],
    queryFn: () => get<InsightsResponse>("/api/insights", { period }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Topbar title="Insights" subtitle={data ? `${data.count} insights detected for ${data.period}` : undefined} />

      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 16 }}>
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <ErrorState message="Failed to load insights." onRetry={refetch} />
        ) : !data?.insights.length ? (
          <EmptyState message="No significant insights detected for this period." />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
            {data.insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
