"""
Breakdown and contribution analytics using SQLAlchemy ORM.
"""
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc

from app.models import Sale, Product, Store, Customer, ExchangeRate


async def breakdown_by_dimension(
    db: AsyncSession,
    dimension: str,
    start: date,
    end: date,
    limit: int = 10,
) -> list[dict]:
    allowed = {
        "category": Product.category,
        "subcategory": Product.subcategory,
        "brand": Product.brand,
        "product_name": Product.product_name,
        "country": Store.country,
        "state": Store.state,
        "customer_country": Customer.country,
        "customer_state": Customer.state,
        "customer_city": Customer.city,
        "customer_continent": Customer.continent,
        "city": Customer.city,
    }
    if dimension not in allowed:
        raise ValueError(f"Invalid dimension: {dimension}. Allowed: {list(allowed.keys())}")

    dim_col = allowed[dimension]
    price_expr = Product.price_expr()
    parsed_date = Sale.parsed_date_expr()

    revenue_expr = func.coalesce(
        func.sum(Sale.quantity * price_expr * func.coalesce(ExchangeRate.exchange, 1.0)),
        0.0
    )

    stmt = (
        select(
            dim_col.label("dimension_value"),
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

    if dimension in ("country", "state"):
        stmt = stmt.join(Store, Sale.storekey == Store.storekey)
    elif dimension in ("customer_country", "customer_state", "customer_city", "customer_continent", "city"):
        stmt = stmt.join(Customer, Sale.customerkey == Customer.customerkey)

    stmt = (
        stmt.where(and_(parsed_date >= start, parsed_date <= end, dim_col.is_not(None)))
        .group_by(dim_col)
        .order_by(desc("revenue"))
        .limit(limit)
    )

    result = await db.execute(stmt)
    rows = result.mappings().all()

    total_revenue = sum(float(r["revenue"]) for r in rows)
    return [
        {
            "label": r["dimension_value"] or "Unknown",
            "revenue": round(float(r["revenue"]), 2),
            "orders": int(r["orders"]),
            "units_sold": int(r["units_sold"]),
            "share_pct": round(float(r["revenue"]) / total_revenue * 100, 1) if total_revenue > 0 else 0,
        }
        for r in rows
    ]


async def find_contributors(
    db: AsyncSession,
    dimension: str,
    current_start: date,
    current_end: date,
    prior_start: date,
    prior_end: date,
    limit: int = 5,
) -> list[dict]:
    current = await breakdown_by_dimension(db, dimension, current_start, current_end, limit=50)
    prior = await breakdown_by_dimension(db, dimension, prior_start, prior_end, limit=50)

    prior_map = {r["label"]: r["revenue"] for r in prior}
    current_map = {r["label"]: r["revenue"] for r in current}

    all_labels = set(current_map) | set(prior_map)
    contributors = []
    for label in all_labels:
        c = current_map.get(label, 0)
        p = prior_map.get(label, 0)
        change = c - p
        pct = round((c - p) / abs(p) * 100, 1) if p > 0 else None
        contributors.append({
            "label": label,
            "current_revenue": round(c, 2),
            "prior_revenue": round(p, 2),
            "change": round(change, 2),
            "change_pct": pct,
            "direction": "up" if change > 0 else "down",
        })

    contributors.sort(key=lambda x: abs(x["change"]), reverse=True)
    return contributors[:limit]


async def rank_entities(
    db: AsyncSession,
    entity_type: str,
    metric: str,
    start: date,
    end: date,
    limit: int = 10,
    bottom: bool = False,
) -> list[dict]:
    if entity_type == "product":
        dim = "product_name"
    elif entity_type == "store":
        dim = "country"
    elif entity_type == "customer":
        dim = "customer_country"
    else:
        raise ValueError(f"Unknown entity_type: {entity_type}")

    rows = await breakdown_by_dimension(db, dim, start, end, limit=200)
    rows.sort(key=lambda x: x.get(metric, 0), reverse=not bottom)
    return rows[:limit]
