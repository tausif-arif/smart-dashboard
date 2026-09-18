"""
Customer behavior analytics using SQLAlchemy ORM models.
"""
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc, case

from app.models import Sale, Product, Customer, ExchangeRate


async def get_customer_behavior(
    db: AsyncSession,
    start: date,
    end: date,
) -> dict:
    parsed_date = Sale.parsed_date_expr()

    # Subquery for order count per customer
    cust_sub = (
        select(
            Sale.customerkey,
            func.count(func.distinct(Sale.order_number)).label("order_count")
        )
        .where(and_(parsed_date >= start, parsed_date <= end))
        .group_by(Sale.customerkey)
        .subquery()
    )

    repeat_stmt = select(
        func.count().label("total_customers"),
        func.sum(case((cust_sub.c.order_count > 1, 1), else_=0)).label("repeat_customers"),
        func.sum(case((cust_sub.c.order_count == 1, 1), else_=0)).label("single_order_customers"),
        func.avg(cust_sub.c.order_count).label("avg_orders_per_customer"),
    )

    repeat_res = await db.execute(repeat_stmt)
    row = repeat_res.mappings().first()

    total = int(row["total_customers"] or 0)
    repeat = int(row["repeat_customers"] or 0)
    repeat_rate = round(repeat / total * 100, 1) if total > 0 else 0

    # Top customers by revenue
    price_expr = Product.price_expr()
    revenue_expr = func.coalesce(
        func.sum(Sale.quantity * price_expr * func.coalesce(ExchangeRate.exchange, 1.0)),
        0.0
    )

    top_stmt = (
        select(
            Sale.customerkey,
            Customer.name,
            Customer.country,
            revenue_expr.label("revenue"),
            func.count(func.distinct(Sale.order_number)).label("orders"),
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
        .join(Customer, Sale.customerkey == Customer.customerkey)
        .where(and_(parsed_date >= start, parsed_date <= end))
        .group_by(Sale.customerkey, Customer.name, Customer.country)
        .order_by(desc("revenue"))
        .limit(10)
    )

    top_res = await db.execute(top_stmt)
    top_customers = [
        {
            "customerkey": r["customerkey"],
            "name": r["name"],
            "country": r["country"],
            "revenue": round(float(r["revenue"]), 2),
            "orders": int(r["orders"]),
        }
        for r in top_res.mappings().all()
    ]

    return {
        "total_customers": total,
        "repeat_customers": repeat,
        "single_order_customers": int(row["single_order_customers"] or 0),
        "repeat_rate_pct": repeat_rate,
        "avg_orders_per_customer": round(float(row["avg_orders_per_customer"] or 0), 2),
        "top_customers": top_customers,
    }
