from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date

from app.core.db import get_db
from app.analytics.metrics import compare_periods
from app.analytics.breakdown import breakdown_by_dimension
from app.analytics.trend import calculate_trend
from app.analytics.anomaly import detect_anomalies
from app.analytics.date_utils import resolve_period, comparable_prior_period
from app.services.insight_service import generate_insights
from app.schemas import OverviewResponse

router = APIRouter(prefix="/api/overview", tags=["overview"])


@router.get("", response_model=OverviewResponse)
async def get_overview(
    period: str = Query("this_year", description="Named period or YYYY-MM-DD:YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db),
):
    start, end = resolve_period(period)
    prior_start, prior_end = comparable_prior_period(start, end)

    comparison = await compare_periods(db, (start, end), (prior_start, prior_end))
    insights = await generate_insights(db, start, end)
    top_categories = await breakdown_by_dimension(db, "category", start, end, limit=6)
    top_countries = await breakdown_by_dimension(db, "country", start, end, limit=6)
    anomalies = await detect_anomalies(db, start, end)

    # Trend: use monthly for long periods, daily for short
    delta_days = (end - start).days
    granularity = "day" if delta_days <= 60 else "month"
    trend = await calculate_trend(db, start, end, granularity=granularity)

    return OverviewResponse(
        period=comparison["current_period"],
        prior_period=comparison["prior_period"],
        metrics=comparison["metrics"],
        insights=insights,
        top_categories=top_categories,
        top_countries=top_countries,
        revenue_trend=trend,
        anomalies=anomalies,
    )
