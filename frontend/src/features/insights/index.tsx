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
    <div className="flex-1 flex flex-col min-w-0 bg-canvas">
      <Topbar title="Insights" subtitle={data ? `${data.count} insights detected for ${data.period}` : undefined} />

      <div className="flex flex-col gap-4 p-4 md:p-8 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <ErrorState message="Failed to load insights." onRetry={refetch} />
        ) : !data?.insights.length ? (
          <EmptyState message="No significant insights detected for this period." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {data.insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
