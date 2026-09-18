"""
Anomaly detection using SQLAlchemy ORM models.
"""
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
import statistics

from app.models import Sale, Product, ExchangeRate


async def detect_anomalies(
    db: AsyncSession,
    start: date,
    end: date,
) -> list[dict]:
    price_expr = Product.price_expr()
    parsed_date = Sale.parsed_date_expr()
    month_col = func.date_trunc('month', parsed_date)

    revenue_expr = func.coalesce(
        func.sum(Sale.quantity * price_expr * func.coalesce(ExchangeRate.exchange, 1.0)),
        0.0
    )

    stmt = (
        select(
            month_col.label("month"),
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
        .where(and_(parsed_date >= start, parsed_date <= end))
        .group_by(month_col)
        .order_by(month_col)
    )

    result = await db.execute(stmt)
    rows = result.mappings().all()

    if len(rows) < 4:
        return []

    revenues = [float(r["revenue"]) for r in rows]
    mean = statistics.mean(revenues)
    stdev = statistics.stdev(revenues) if len(revenues) > 1 else 0

    anomalies = []
    for r in rows:
        rev = float(r["revenue"])
        if stdev == 0:
            continue
        z = (rev - mean) / stdev
        if abs(z) >= 1.5:
            severity = "high" if abs(z) >= 2.5 else "medium"
            direction = "above" if z > 0 else "below"
            anomalies.append({
                "period": r["month"].isoformat() if r["month"] else None,
                "metric": "revenue",
                "value": round(rev, 2),
                "baseline": round(mean, 2),
                "z_score": round(z, 2),
                "direction": direction,
                "magnitude": f"{abs(z):.1f}× std dev",
                "severity": severity,
                "evidence": (
                    f"Revenue of ${rev:,.0f} is {direction} the ${mean:,.0f} "
                    f"monthly average by {abs(z):.1f} standard deviations."
                ),
            })

    anomalies.sort(key=lambda x: abs(x["z_score"]), reverse=True)
    return anomalies[:5]
