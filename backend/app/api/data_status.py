from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime

from app.core.db import get_db

router = APIRouter(prefix="/api/data-status", tags=["data-status"])


@router.get("")
async def get_data_status(db: AsyncSession = Depends(get_db)):
    tables = ["customers", "sales", "products", "stores", "exchange_rates"]
    table_stats = []

    for table in tables:
        result = await db.execute(text(f"SELECT COUNT(*) FROM {table}"))
        count = result.scalar()
        table_stats.append({"table": table, "row_count": count})

    # Get date range of sales data
    date_result = await db.execute(text(
        "SELECT MIN(order_date) AS min_date, MAX(order_date) AS max_date FROM sales"
    ))
    date_row = date_result.mappings().first()

    return {
        "tables": table_stats,
        "sales_date_range": {
            "min": date_row["min_date"] if date_row else None,
            "max": date_row["max_date"] if date_row else None,
        },
        "last_checked": datetime.utcnow().isoformat(),
        "is_stale": False,  # No real-time ingestion; data is static dataset
    }
