import { AlertCircle, RefreshCw } from "lucide-react";

// ─── Error State ─────────────────────────────────────────────────────────────

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Something went wrong.", onRetry }: ErrorProps) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      padding: "40px 24px",
      color: "var(--mute)",
    }}>
      <AlertCircle size={24} color="var(--error)" />
      <p style={{ fontSize: "0.875rem", color: "var(--body)", textAlign: "center" }}>{message}</p>
      {onRetry && (
        <button className="btn btn-ghost" onClick={onRetry}>
          <RefreshCw size={14} /> Try again
        </button>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyProps {
  message?: string;
}

export function EmptyState({ message = "No data available for this period." }: EmptyProps) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      padding: "40px 24px",
    }}>
      <p style={{ fontSize: "0.875rem", color: "var(--mute)", textAlign: "center" }}>{message}</p>
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

interface SkeletonProps {
  height?: number;
  width?: string;
  count?: number;
}

export function Skeleton({ height = 20, width = "100%", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height, width, borderRadius: "var(--radius-sm)" }}
        />
      ))}
    </>
  );
}

export function MetricSkeleton() {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Skeleton height={12} width="60px" />
      <Skeleton height={32} width="100px" />
      <Skeleton height={20} width="80px" />
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={16} width={i === 0 ? "70%" : i === 1 ? "100%" : "50%"} />
      ))}
    </div>
  );
}
