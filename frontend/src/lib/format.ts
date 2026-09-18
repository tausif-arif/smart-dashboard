import { BRAND_CONFIG } from "@/config/brand";

export function formatCurrency(value: number, decimals = 0): string {
  return new Intl.NumberFormat(BRAND_CONFIG.locale, {
    style: "currency",
    currency: BRAND_CONFIG.currency,
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat(BRAND_CONFIG.locale, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number | null, decimals = 1): string {
  if (value === null) return "New";
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `${BRAND_CONFIG.currencySymbol}${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${BRAND_CONFIG.currencySymbol}${(value / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(value);
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return formatNumber(value);
}

export function periodLabel(period: string): string {
  const labels: Record<string, string> = {
    today: "Today",
    yesterday: "Yesterday",
    this_week: "This Week",
    last_week: "Last Week",
    this_month: "This Month",
    last_month: "Last Month",
    this_quarter: "This Quarter",
    last_quarter: "Last Quarter",
    this_year: "This Year",
    last_year: "Last Year",
  };
  return labels[period] ?? period;
}
