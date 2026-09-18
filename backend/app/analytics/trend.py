"""
Trend analytics using SQLAlchemy ORM models.
"""
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.models import Sale, Product, Store, ExchangeRate


async def calculate_trend(
    db: AsyncSession,
    start: date,
    end: date,
    granularity: str = "month",
    dimension: str | None = None,
    dimension_value: str | None = None,
) -> list[dict]:
    price_expr = Product.price_expr()
    parsed_date = Sale.parsed_date_expr()

    period_col = func.date_trunc(granularity, parsed_date)
    revenue_expr = func.coalesce(
        func.sum(Sale.quantity * price_expr * func.coalesce(ExchangeRate.exchange, 1.0)),
        0.0
    )

    stmt = (
        select(
            period_col.label("period"),
            revenue_expr.label("revenue"),
            func.count(func.distinct(Sale.order_number)).label("orders"),
            func.coalesce(func.sum(Sale.quantity), 0).label("units_sold"),
        )
        .select_from(Sale)
        .join(Product, Sale.productkey == Product.productkey)
        .outerjoin(
            ExchangeRate,
            and_(
                ExchangeRate.date == Sale.order_date,
                ExchangeRate.currency == Sale.currency_code
            )
        )
    )

    filters = [parsed_date >= start, parsed_date <= end]

    if dimension == "category" and dimension_value:
        filters.append(Product.category == dimension_value)
    elif dimension == "country" and dimension_value:
        stmt = stmt.join(Store, Sale.storekey == Store.storekey)
        filters.append(Store.country == dimension_value)
    elif dimension == "brand" and dimension_value:
        filters.append(Product.brand == dimension_value)

    stmt = stmt.where(and_(*filters)).group_by(period_col).order_by(period_col)

    result = await db.execute(stmt)
    rows = result.mappings().all()

    return [
        {
            "period": r["period"].isoformat() if r["period"] else None,
            "revenue": round(float(r["revenue"]), 2),
            "orders": int(r["orders"]),
            "units_sold": int(r["units_sold"]),
        }
        for r in rows
    ]
