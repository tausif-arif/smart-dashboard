from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import get_settings
from app.core.db import engine
from app.api import overview, sales, products, customers, insights, data_status, ask

settings = get_settings()

app = FastAPI(
    title="Smart BI Dashboard API",
    description="Business intelligence API for the Smart Dashboard",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(overview.router)
app.include_router(sales.router)
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(insights.router)
app.include_router(data_status.router)
app.include_router(ask.router)


@app.get("/health")
async def health():
    """Health check — verifies DB connection and returns table row counts."""
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.core.db import AsyncSessionFactory

    counts = {}
    async with AsyncSessionFactory() as db:
        for table in ["customers", "sales", "products", "stores", "exchange_rates"]:
            result = await db.execute(text(f"SELECT COUNT(*) FROM {table}"))
            counts[table] = result.scalar()

    return {"status": "ok", "database": "connected", "table_counts": counts}
