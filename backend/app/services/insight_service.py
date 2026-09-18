"""
Insight generation service — produces InsightCard list from analytics without LLM.
These are auto-generated from real data; no fabricated insights.
"""
from datetime import date
from typing import Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.metrics import compare_periods
from app.analytics.breakdown import breakdown_by_dimension, find_contributors
from app.analytics.anomaly import detect_anomalies
from app.analytics.date_utils import comparable_prior_period
from app.schemas import InsightCard


async def generate_insights(
    db: AsyncSession,
    start: date,
    end: date,
) -> list[InsightCard]:
    """
    Automatically generate InsightCards from real data.
    Each insight is backed by analytics evidence — nothing fabricated.
    """
    insights: list[InsightCard] = []
    prior_start, prior_end = comparable_prior_period(start, end)

    # 1. Revenue change insight
    comparison = await compare_periods(db, (start, end), (prior_start, prior_end))
    rev = comparison["metrics"]["revenue"]
    if rev["growth_pct"] is not None and abs(rev["growth_pct"]) >= 3:
        direction = "declined" if rev["direction"] == "down" else "grew"
        severity = "high" if abs(rev["growth_pct"]) >= 15 else "medium"
        insights.append(InsightCard(
            id=str(uuid.uuid4()),
            type="decline" if rev["direction"] == "down" else "growth",
            title=f"Revenue {direction} {abs(rev['growth_pct']):.1f}%",
            explanation=(
                f"Revenue {direction} from ${rev['previous']:,.0f} to "
                f"${rev['current']:,.0f} compared with the prior period "
                f"({comparison['prior_period']})."
            ),
            metric="revenue",
            change_pct=rev["growth_pct"],
            severity=severity,
            affected_entity=None,
            evidence=f"${rev['current']:,.0f} vs ${rev['previous']:,.0f} prior period.",
            actions=["View Revenue Trend", "Investigate by Category", "Check Location Performance"],
        ))

    # 2. Top category contributor to change
    try:
        contributors = await find_contributors(
            db, "category", start, end, prior_start, prior_end, limit=3
        )
        if contributors:
            top = contributors[0]
            if top["change_pct"] is not None and abs(top["change_pct"]) >= 5:
                direction_w = "decline" if top["direction"] == "down" else "growth"
                insights.append(InsightCard(
                    id=str(uuid.uuid4()),
                    type="decline" if top["direction"] == "down" else "growth",
                    title=f"{top['label']} is the top category contributor to revenue {direction_w}",
                    explanation=(
                        f"{top['label']} revenue changed by ${abs(top['change']):,.0f} "
                        f"({'+' if top['direction']=='up' else ''}{top['change_pct']:.1f}%), "
                        f"making it the largest single contributor."
                    ),
                    metric="revenue",
                    change_pct=top["change_pct"],
                    severity="high" if abs(top["change_pct"] or 0) >= 15 else "medium",
                    affected_entity=top["label"],
                    evidence=(
                        f"{top['label']}: ${top['current_revenue']:,.0f} current vs "
                        f"${top['prior_revenue']:,.0f} prior."
                    ),
                    actions=[f"View {top['label']} Products", "Compare by Location"],
                ))
    except Exception:
        pass

    # 3. Anomalies
    try:
        anomalies = await detect_anomalies(db, start, end)
        for anomaly in anomalies[:2]:
            insights.append(InsightCard(
                id=str(uuid.uuid4()),
                type="anomaly",
                title=f"Unusual revenue in {anomaly['period'][:7]}",
                explanation=anomaly["evidence"],
                metric="revenue",
                change_pct=None,
                severity=anomaly["severity"],
                affected_entity=anomaly["period"][:7],
                evidence=anomaly["evidence"],
                actions=["View Time Period", "Check Category Breakdown"],
            ))
    except Exception:
        pass

    # 4. Orders change
    orders = comparison["metrics"]["orders"]
    if orders["growth_pct"] is not None and abs(orders["growth_pct"]) >= 5:
        direction = "dropped" if orders["direction"] == "down" else "increased"
        insights.append(InsightCard(
            id=str(uuid.uuid4()),
            type="decline" if orders["direction"] == "down" else "growth",
            title=f"Order volume {direction} {abs(orders['growth_pct']):.1f}%",
            explanation=(
                f"Orders {direction} from {orders['previous']:,.0f} to "
                f"{orders['current']:,.0f} vs the prior period."
            ),
            metric="orders",
            change_pct=orders["growth_pct"],
            severity="medium",
            affected_entity=None,
            evidence=f"{orders['current']:,} orders vs {orders['previous']:,} prior.",
            actions=["View Sales Trend", "Check Product Performance"],
        ))

    return insights
