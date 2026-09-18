"""
Controlled analytics tools exposed to the LLM via OpenAI function-calling.
The LLM NEVER executes arbitrary SQL. It only calls these validated tools.
"""
from datetime import date
from typing import Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.metrics import calculate_metric, compare_periods
from app.analytics.breakdown import breakdown_by_dimension, find_contributors, rank_entities
from app.analytics.trend import calculate_trend
from app.analytics.anomaly import detect_anomalies
from app.analytics.customer import get_customer_behavior
from app.analytics.date_utils import resolve_period, comparable_prior_period, format_period_label


# Tool definitions for OpenAI function-calling
TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_metric",
            "description": "Get the value of a specific business metric for a time period.",
            "parameters": {
                "type": "object",
                "properties": {
                    "metric": {
                        "type": "string",
                        "enum": ["revenue", "orders", "units_sold", "customers", "aov", "gross_profit", "gross_margin"],
                        "description": "The metric to retrieve",
                    },
                    "period": {
                        "type": "string",
                        "description": "Named period (e.g. 'this_year', 'last_month', 'this_month', 'YYYY-MM-DD:YYYY-MM-DD')",
                    },
                },
                "required": ["metric", "period"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "compare_periods",
            "description": "Compare all key metrics between the current period and the prior comparable period.",
            "parameters": {
                "type": "object",
                "properties": {
                    "period": {"type": "string", "description": "Current period"},
                },
                "required": ["period"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "breakdown_metric",
            "description": "Break down revenue by a business dimension (category, brand, country, etc.).",
            "parameters": {
                "type": "object",
                "properties": {
                    "dimension": {
                        "type": "string",
                        "enum": ["category", "subcategory", "brand", "product_name", "country", "state", "customer_country", "customer_continent"],
                    },
                    "period": {"type": "string"},
                    "limit": {"type": "integer", "default": 5},
                },
                "required": ["dimension", "period"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_top_contributors",
            "description": "Find which entities contributed most to revenue change between current and prior period.",
            "parameters": {
                "type": "object",
                "properties": {
                    "dimension": {
                        "type": "string",
                        "enum": ["category", "subcategory", "brand", "country", "customer_country"],
                    },
                    "period": {"type": "string"},
                    "limit": {"type": "integer", "default": 5},
                },
                "required": ["dimension", "period"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "detect_anomalies",
            "description": "Detect statistically unusual revenue patterns (anomalies) in the time range.",
            "parameters": {
                "type": "object",
                "properties": {
                    "period": {"type": "string"},
                },
                "required": ["period"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_trend",
            "description": "Get time-series revenue and order data for trend analysis.",
            "parameters": {
                "type": "object",
                "properties": {
                    "period": {"type": "string"},
                    "granularity": {"type": "string", "enum": ["day", "week", "month"], "default": "month"},
                    "dimension": {"type": "string", "description": "Optional dimension filter (e.g. 'category')"},
                    "dimension_value": {"type": "string", "description": "Value for the dimension filter"},
                },
                "required": ["period"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_customer_behavior",
            "description": "Get customer behavior analytics: repeat rate, new vs returning, top customers.",
            "parameters": {
                "type": "object",
                "properties": {
                    "period": {"type": "string"},
                },
                "required": ["period"],
            },
        },
    },
]


async def execute_tool(tool_name: str, arguments: dict, db: AsyncSession) -> Any:
    """Execute a validated analytics tool call. Never executes arbitrary SQL."""

    def get_range(period: str):
        start, end = resolve_period(period)
        return start, end

    if tool_name == "get_metric":
        start, end = get_range(arguments["period"])
        value = await calculate_metric(db, arguments["metric"], start, end)
        label = format_period_label(start, end)
        return {"metric": arguments["metric"], "value": value, "period": label}

    elif tool_name == "compare_periods":
        start, end = get_range(arguments["period"])
        prior = comparable_prior_period(start, end)
        result = await compare_periods(db, (start, end), prior)
        return result

    elif tool_name == "breakdown_metric":
        start, end = get_range(arguments["period"])
        limit = arguments.get("limit", 5)
        result = await breakdown_by_dimension(db, arguments["dimension"], start, end, limit=limit)
        return {"dimension": arguments["dimension"], "period": format_period_label(start, end), "data": result}

    elif tool_name == "get_top_contributors":
        start, end = get_range(arguments["period"])
        prior_start, prior_end = comparable_prior_period(start, end)
        result = await find_contributors(
            db, arguments["dimension"], start, end, prior_start, prior_end, limit=arguments.get("limit", 5)
        )
        return {"dimension": arguments["dimension"], "contributors": result}

    elif tool_name == "detect_anomalies":
        start, end = get_range(arguments["period"])
        result = await detect_anomalies(db, start, end)
        return {"anomalies": result, "count": len(result)}

    elif tool_name == "get_trend":
        start, end = get_range(arguments["period"])
        result = await calculate_trend(
            db, start, end,
            granularity=arguments.get("granularity", "month"),
            dimension=arguments.get("dimension"),
            dimension_value=arguments.get("dimension_value"),
        )
        return {"trend": result, "granularity": arguments.get("granularity", "month")}

    elif tool_name == "get_customer_behavior":
        start, end = get_range(arguments["period"])
        result = await get_customer_behavior(db, start, end)
        return result

    else:
        raise ValueError(f"Unknown tool: {tool_name}")
