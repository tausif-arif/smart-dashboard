"""
Semantic metric definitions — the single source of truth for what each metric means.
Analytics functions MUST use these definitions, never define metrics ad hoc.
"""
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class MetricDefinition:
    name: str
    label: str
    description: str
    unit: str               # 'currency' | 'count' | 'percent' | 'ratio'
    currency: bool = False
    higher_is_better: Optional[bool] = True
    format_prefix: str = ""
    format_suffix: str = ""
    decimals: int = 0


METRICS: dict[str, MetricDefinition] = {
    "revenue": MetricDefinition(
        name="revenue",
        label="Revenue",
        description="Total revenue = SUM(quantity × unit_price_usd), converted to USD via exchange rates",
        unit="currency",
        currency=True,
        higher_is_better=True,
        format_prefix="$",
        decimals=0,
    ),
    "orders": MetricDefinition(
        name="orders",
        label="Orders",
        description="COUNT(DISTINCT order_number)",
        unit="count",
        higher_is_better=True,
        decimals=0,
    ),
    "units_sold": MetricDefinition(
        name="units_sold",
        label="Units Sold",
        description="SUM(quantity)",
        unit="count",
        higher_is_better=True,
        decimals=0,
    ),
    "customers": MetricDefinition(
        name="customers",
        label="Customers",
        description="COUNT(DISTINCT customerkey) with at least one order in the period",
        unit="count",
        higher_is_better=True,
        decimals=0,
    ),
    "aov": MetricDefinition(
        name="aov",
        label="Avg Order Value",
        description="Revenue / COUNT(DISTINCT order_number)",
        unit="currency",
        currency=True,
        higher_is_better=True,
        format_prefix="$",
        decimals=2,
    ),
    "gross_margin": MetricDefinition(
        name="gross_margin",
        label="Gross Margin %",
        description="(Revenue - Cost) / Revenue × 100",
        unit="percent",
        higher_is_better=True,
        format_suffix="%",
        decimals=1,
    ),
    "gross_profit": MetricDefinition(
        name="gross_profit",
        label="Gross Profit",
        description="SUM(quantity × (unit_price_usd - unit_cost_usd))",
        unit="currency",
        currency=True,
        higher_is_better=True,
        format_prefix="$",
        decimals=0,
    ),
}


def get_metric(name: str) -> MetricDefinition:
    if name not in METRICS:
        raise ValueError(f"Unknown metric: {name}. Available: {list(METRICS.keys())}")
    return METRICS[name]
