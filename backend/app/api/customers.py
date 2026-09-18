from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.analytics.date_utils import resolve_period, comparable_prior_period
from app.analytics.customer import get_customer_behavior
from app.analytics.metrics import compare_periods
from app.analytics.breakdown import breakdown_by_dimension

router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.get("")
async def get_customers(
    period: str = Query("this_year"),
    db: AsyncSession = Depends(get_db),
):
    start, end = resolve_period(period)
    prior_start, prior_end = comparable_prior_period(start, end)

    comparison = await compare_periods(db, (start, end), (prior_start, prior_end))
    behavior = await get_customer_behavior(db, start, end)
    prior_behavior = await get_customer_behavior(db, prior_start, prior_end)
    by_country = await breakdown_by_dimension(db, "customer_country", start, end, limit=10)
    by_continent = await breakdown_by_dimension(db, "customer_continent", start, end, limit=8)

    # Compute repeat rate change
    repeat_change = None
    if prior_behavior["repeat_rate_pct"] > 0:
        repeat_change = round(
            behavior["repeat_rate_pct"] - prior_behavior["repeat_rate_pct"], 1
        )

    return {
        "period": comparison["current_period"],
        "prior_period": comparison["prior_period"],
        "metrics": comparison["metrics"],
        "behavior": behavior,
        "prior_behavior": prior_behavior,
        "repeat_rate_change": repeat_change,
        "by_country": by_country,
        "by_continent": by_continent,
    }
