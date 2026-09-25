import { useDashboardStore } from "@/stores/dashboardStore";
import type { Period } from "@/types/api.types";
import { periodLabel } from "@/lib/format";

const PERIODS: Period[] = [
  "this_month", "last_month", "this_quarter", "last_quarter", "this_year", "last_year",
];

interface Props {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: Props) {
  const { period, setPeriod } = useDashboardStore();

  return (
    <div className="sticky top-[52px] md:top-0 z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-4 bg-canvas-elevated border-b border-hairline shadow-whisper">
      <div>
        <h1 className="text-heading-md m-0">{title}</h1>
        {subtitle && <p className="text-body-sm text-mute m-0 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="bg-canvas-elevated text-ink border border-hairline rounded-sm px-2.5 py-1.5 text-body-sm font-medium focus:outline-none focus:border-ink transition-colors cursor-pointer"
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>{periodLabel(p)}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
