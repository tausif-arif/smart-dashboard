"""
Core metrics calculation — pure SQLAlchemy ORM queries using Model definitions.
"""
from datetime import date
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.models import Sale, Product, ExchangeRate
from app.analytics.date_utils import DateRange, comparable_prior_period, format_period_label


async def _run_metrics_query(
    db: AsyncSession, start: date, end: date, extra_where=None
) -> dict:
    price_expr = Product.price_expr()
    cost_expr = Product.cost_expr()
    parsed_date = Sale.parsed_date_expr()

    revenue_stmt = func.coalesce(
        func.sum(
            Sale.quantity * price_expr * func.coalesce(ExchangeRate.exchange, 1.0)
        ),
        0.0
    )
    cost_stmt = func.coalesce(
        func.sum(
            Sale.quantity * cost_expr * func.coalesce(ExchangeRate.exchange, 1.0)
        ),
        0.0
    )
    orders_stmt = func.count(func.distinct(Sale.order_number))
    customers_stmt = func.count(func.distinct(Sale.customerkey))
    units_stmt = func.coalesce(func.sum(Sale.quantity), 0)

    stmt = (
        select(
            revenue_stmt.label("revenue"),
            cost_stmt.label("cost"),
            orders_stmt.label("orders"),
            customers_stmt.label("customers"),
            units_stmt.label("units_sold"),
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
        .where(and_(parsed_date >= start, parsed_date <= end))
    )

    if extra_where is not None:
        stmt = stmt.where(extra_where)

    result = await db.execute(stmt)
    row = result.mappings().first()
    if not row:
        return {"revenue": 0, "cost": 0, "orders": 0, "customers": 0, "units_sold": 0}

    rev = float(row["revenue"] or 0)
    cost = float(row["cost"] or 0)
    orders = int(row["orders"] or 0)
    customers = int(row["customers"] or 0)
    units_sold = int(row["units_sold"] or 0)

    return {
        "revenue": rev,
        "cost": cost,
        "gross_profit": rev - cost,
        "gross_margin": round((rev - cost) / rev * 100, 2) if rev > 0 else 0,
        "orders": orders,
        "customers": customers,
        "units_sold": units_sold,
        "aov": round(rev / orders, 2) if orders > 0 else 0,
    }


def _calculate_growth(current: float, previous: float) -> Optional[float]:
    if previous == 0:
        return None
    return round((current - previous) / abs(previous) * 100, 2)


async def calculate_metric(
    db: AsyncSession,
    metric: str,
    start: date,
    end: date,
    extra_where=None,
) -> float:
    data = await _run_metrics_query(db, start, end, extra_where)
    return data.get(metric, 0)


async def compare_periods(
    db: AsyncSession,
    current_range: DateRange,
    prior_range: DateRange | None = None,
    extra_where=None,
) -> dict:
    start, end = current_range
    if prior_range is None:
        prior_range = comparable_prior_period(start, end)
    prior_start, prior_end = prior_range

    current = await _run_metrics_query(db, start, end, extra_where)
    prior = await _run_metrics_query(db, prior_start, prior_end, extra_where)

    result = {
        "current_period": format_period_label(start, end),
        "prior_period": format_period_label(prior_start, prior_end),
        "metrics": {},
    }

    for key in current:
        c_val = current[key]
        p_val = prior[key]
        growth = _calculate_growth(c_val, p_val)
        result["metrics"][key] = {
            "current": c_val,
            "previous": p_val,
            "change": round(c_val - p_val, 2),
            "growth_pct": growth,
            "direction": "up" if (growth or 0) > 0 else ("down" if (growth or 0) < 0 else "flat"),
            "is_new": growth is None,
        }

    return result
