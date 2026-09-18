from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.analytics.date_utils import resolve_period, comparable_prior_period
from app.analytics.breakdown import breakdown_by_dimension, find_contributors
from app.analytics.metrics import compare_periods

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("")
async def get_products(
    period: str = Query("this_year"),
    db: AsyncSession = Depends(get_db),
):
    start, end = resolve_period(period)
    prior_start, prior_end = comparable_prior_period(start, end)

    comparison = await compare_periods(db, (start, end), (prior_start, prior_end))
    top_products = await breakdown_by_dimension(db, "product_name", start, end, limit=10)
    by_category = await breakdown_by_dimension(db, "category", start, end, limit=8)
    by_subcategory = await breakdown_by_dimension(db, "subcategory", start, end, limit=10)
    by_brand = await breakdown_by_dimension(db, "brand", start, end, limit=10)

    product_contributors = await find_contributors(
        db, "category", start, end, prior_start, prior_end, limit=8
    )

    return {
        "period": comparison["current_period"],
        "prior_period": comparison["prior_period"],
        "metrics": comparison["metrics"],
        "top_products": top_products,
        "by_category": by_category,
        "by_subcategory": by_subcategory,
        "by_brand": by_brand,
        "period_contributors": product_contributors,
    }
