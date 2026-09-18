from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.analytics.date_utils import resolve_period
from app.services.insight_service import generate_insights

router = APIRouter(prefix="/api/insights", tags=["insights"])


@router.get("")
async def get_insights(
    period: str = Query("this_year"),
    db: AsyncSession = Depends(get_db),
):
    start, end = resolve_period(period)
    insights = await generate_insights(db, start, end)
    return {"period": f"{start} to {end}", "insights": insights, "count": len(insights)}


@router.get("/{insight_id}")
async def get_insight(insight_id: str, db: AsyncSession = Depends(get_db)):
    # In a full implementation, insights would be persisted; for now re-generate and find
    return {"message": "Insight detail endpoint — use /api/insights for full list"}
