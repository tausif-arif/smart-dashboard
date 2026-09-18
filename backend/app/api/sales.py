from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.db import get_db
from app.analytics.date_utils import resolve_period, comparable_prior_period
from app.analytics.breakdown import breakdown_by_dimension, find_contributors
from app.analytics.trend import calculate_trend
from app.analytics.metrics import compare_periods

router = APIRouter(prefix="/api/sales", tags=["sales"])


@router.get("")
async def get_sales(
    period: str = Query("this_year"),
    db: AsyncSession = Depends(get_db),
):
    start, end = resolve_period(period)
    prior_start, prior_end = comparable_prior_period(start, end)

    comparison = await compare_periods(db, (start, end), (prior_start, prior_end))
    by_category = await breakdown_by_dimension(db, "category", start, end, limit=10)
    by_country = await breakdown_by_dimension(db, "country", start, end, limit=10)
    by_brand = await breakdown_by_dimension(db, "brand", start, end, limit=10)

    delta_days = (end - start).days
    granularity = "day" if delta_days <= 60 else "month"
    trend = await calculate_trend(db, start, end, granularity=granularity)

    category_contributors = await find_contributors(
        db, "category", start, end, prior_start, prior_end, limit=5
    )
    country_contributors = await find_contributors(
        db, "country", start, end, prior_start, prior_end, limit=5
    )

    return {
        "period": comparison["current_period"],
        "prior_period": comparison["prior_period"],
        "metrics": comparison["metrics"],
        "by_category": by_category,
        "by_country": by_country,
        "by_brand": by_brand,
        "trend": trend,
        "category_drivers": category_contributors,
        "country_drivers": country_contributors,
    }
