// API types matching FastAPI Pydantic schemas exactly

export interface MetricComparison {
  current: number;
  previous: number;
  change: number;
  growth_pct: number | null;
  direction: "up" | "down" | "flat";
  is_new: boolean;
}

export interface BreakdownItem {
  label: string;
  revenue: number;
  orders: number;
  units_sold: number;
  share_pct: number;
}

export interface ContributorItem {
  label: string;
  current_revenue: number;
  prior_revenue: number;
  change: number;
  change_pct: number | null;
  direction: "up" | "down";
}

export interface TrendPoint {
  period: string;
  revenue: number;
  orders: number;
  units_sold: number;
}

export interface AnomalyItem {
  period: string;
  metric: string;
  value: number;
  baseline: number;
  z_score: number;
  direction: string;
  magnitude: string;
  severity: "high" | "medium" | "low";
  evidence: string;
}

export interface InsightCard {
  id: string;
  type: "anomaly" | "decline" | "growth" | "opportunity" | "risk" | "unusual_behavior" | "trend_change";
  title: string;
  explanation: string;
  metric: string;
  change_pct: number | null;
  severity: "high" | "medium" | "low";
  affected_entity: string | null;
  evidence: string | null;
  actions: string[];
}

export interface OverviewResponse {
  period: string;
  prior_period: string;
  metrics: {
    revenue: MetricComparison;
    orders: MetricComparison;
    customers: MetricComparison;
    units_sold: MetricComparison;
    aov: MetricComparison;
    gross_profit: MetricComparison;
    gross_margin: MetricComparison;
  };
  insights: InsightCard[];
  top_categories: BreakdownItem[];
  top_countries: BreakdownItem[];
  revenue_trend: TrendPoint[];
  anomalies: AnomalyItem[];
}

export interface SalesResponse {
  period: string;
  prior_period: string;
  metrics: OverviewResponse["metrics"];
  by_category: BreakdownItem[];
  by_country: BreakdownItem[];
  by_brand: BreakdownItem[];
  trend: TrendPoint[];
  category_drivers: ContributorItem[];
  country_drivers: ContributorItem[];
}

export interface ProductsResponse {
  period: string;
  prior_period: string;
  metrics: OverviewResponse["metrics"];
  top_products: BreakdownItem[];
  by_category: BreakdownItem[];
  by_subcategory: BreakdownItem[];
  by_brand: BreakdownItem[];
  period_contributors: ContributorItem[];
}

export interface CustomerBehavior {
  total_customers: number;
  repeat_customers: number;
  single_order_customers: number;
  repeat_rate_pct: number;
  avg_orders_per_customer: number;
  top_customers: Array<{
    customerkey: number;
    name: string;
    country: string;
    revenue: number;
    orders: number;
  }>;
}

export interface CustomersResponse {
  period: string;
  prior_period: string;
  metrics: OverviewResponse["metrics"];
  behavior: CustomerBehavior;
  prior_behavior: CustomerBehavior;
  repeat_rate_change: number | null;
  by_country: BreakdownItem[];
  by_continent: BreakdownItem[];
}

export interface EvidenceItem {
  metric: string;
  period: string;
  comparison?: string;
  segment?: string;
  current: unknown;
  previous?: unknown;
  change?: string;
}

export interface AIResponse {
  conversation_id: string;
  question: string;
  summary: string;
  findings: Array<{ title: string; detail: string; evidence: string }>;
  evidence: EvidenceItem[];
  drivers: Array<{ label: string; impact: string; direction: string }>;
  recommended_actions: string[];
  follow_up_questions: string[];
  visualizations: Array<{ type: string; title: string; data_key: string }>;
}

export interface DataStatusResponse {
  tables: Array<{ table: string; row_count: number }>;
  sales_date_range: { min: string; max: string };
  last_checked: string;
  is_stale: boolean;
}

export interface InsightsResponse {
  period: string;
  insights: InsightCard[];
  count: number;
}

export type Period =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "last_quarter"
  | "this_year"
  | "last_year";
