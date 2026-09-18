from pydantic import BaseModel
from typing import Optional, Any


class MetricComparison(BaseModel):
    current: float
    previous: float
    change: float
    growth_pct: Optional[float]
    direction: str  # 'up' | 'down' | 'flat'
    is_new: bool


class PeriodMetrics(BaseModel):
    current_period: str
    prior_period: str
    metrics: dict[str, MetricComparison]


class BreakdownItem(BaseModel):
    label: str
    revenue: float
    orders: int
    units_sold: int
    share_pct: float


class ContributorItem(BaseModel):
    label: str
    current_revenue: float
    prior_revenue: float
    change: float
    change_pct: Optional[float]
    direction: str


class TrendPoint(BaseModel):
    period: str
    revenue: float
    orders: int
    units_sold: int


class AnomalyItem(BaseModel):
    period: str
    metric: str
    value: float
    baseline: float
    z_score: float
    direction: str
    magnitude: str
    severity: str
    evidence: str


class InsightCard(BaseModel):
    id: str
    type: str   # 'anomaly' | 'decline' | 'growth' | 'opportunity' | 'risk'
    title: str
    explanation: str
    metric: str
    change_pct: Optional[float]
    severity: str   # 'high' | 'medium' | 'low'
    affected_entity: Optional[str]
    evidence: Optional[str]
    actions: list[str]


class OverviewResponse(BaseModel):
    period: str
    prior_period: str
    metrics: dict[str, MetricComparison]
    insights: list[InsightCard]
    top_categories: list[BreakdownItem]
    top_countries: list[BreakdownItem]
    revenue_trend: list[TrendPoint]
    anomalies: list[AnomalyItem]


class DataStatusResponse(BaseModel):
    tables: list[dict]
    last_checked: str
    is_stale: bool


class AskRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None


class EvidenceItem(BaseModel):
    metric: str
    period: str
    comparison: Optional[str]
    segment: Optional[str]
    current: Any
    previous: Optional[Any]
    change: Optional[str]


class AIResponse(BaseModel):
    conversation_id: str
    question: str
    summary: str
    findings: list[dict]
    evidence: list[EvidenceItem]
    drivers: list[dict]
    recommended_actions: list[str]
    follow_up_questions: list[str]
    visualizations: list[dict]
