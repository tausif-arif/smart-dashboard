"""
LLM orchestrator — OpenAI function-calling with controlled analytics tools.
The LLM receives the user's question and picks which analytics tools to call.
It NEVER sees raw database rows. It only sees tool results.
"""
import json
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from openai import AsyncOpenAI

from app.core.config import get_settings
from app.ai.tools import TOOL_SCHEMAS, execute_tool
from app.analytics.date_utils import resolve_period
from app.analytics.metrics import compare_periods
from app.analytics.breakdown import breakdown_by_dimension

settings = get_settings()

SYSTEM_PROMPT = """You are a senior business intelligence analyst for a retail company.
You have access to analytics tools that query the company's sales database.

Your job:
1. Understand the user's business question
2. Call the appropriate analytics tools to gather evidence
3. Synthesize findings into a clear, evidence-backed answer

Rules:
- NEVER invent numbers, trends, or business events
- ALWAYS base conclusions on tool results
- If data is insufficient, say so clearly
- Be specific: quote actual numbers from tool results
- Distinguish between FACT (from data), INTERPRETATION (from data), and INVESTIGATION (suggested next step)

When returning your response, ALWAYS output valid JSON with these exact keys:
{
  "summary": "Clear executive summary of the answer",
  "findings": [{"title": "...", "detail": "...", "evidence": "..."}],
  "evidence": [{"metric": "...", "period": "...", "current": 0, "previous": 0, "change": "..."}],
  "drivers": [{"label": "...", "impact": "...", "direction": "up"}],
  "recommended_actions": ["Action 1", "Action 2"],
  "follow_up_questions": ["Question 1", "Question 2"],
  "visualizations": []
}
"""


async def orchestrate(
    question: str,
    db: AsyncSession,
    conversation_history: list[dict] = [],
) -> dict:
    q_lower = question.strip().lower()

    # Instant response for conversational greetings
    if q_lower in ("hi", "hello", "hey", "hi there", "hello there", "help", "who are you"):
        return {
            "structured": {
                "summary": "Hello! I am your Smart BI Assistant. How can I help you analyze your business performance today?",
                "findings": [
                    {
                        "title": "Real-Time Enterprise Analytics Ready",
                        "detail": "Ask me anything about your revenue, sales drivers, product breakdown, customer distribution by city/state, or data anomalies.",
                        "evidence": "Connected to PostgreSQL database with 60,000+ sales records"
                    }
                ],
                "evidence": [],
                "drivers": [],
                "recommended_actions": [
                    "Analyze revenue performance for this year",
                    "Find top product categories by growth",
                    "Show sales distribution across states & cities"
                ],
                "follow_up_questions": [
                    "Why did revenue change this year?",
                    "Which product categories are growing fastest?",
                    "Which countries or states have the highest sales?",
                    "Are there any unusual sales patterns?"
                ],
                "visualizations": []
            },
            "tool_results": [],
            "messages_for_history": []
        }

    client_kwargs = {"api_key": settings.openai_api_key}
    if settings.openai_base_url:
        client_kwargs["base_url"] = settings.openai_base_url
    client = AsyncOpenAI(**client_kwargs)

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *conversation_history,
        {"role": "user", "content": question},
    ]

    tool_results_for_context = []

    try:
        # Agentic loop — up to 3 tool-call rounds for speed
        for _ in range(3):
            response = await client.chat.completions.create(
                model=settings.openai_model,
                messages=messages,
                tools=TOOL_SCHEMAS,
                tool_choice="auto",
                temperature=0.2,
            )

            msg = response.choices[0].message
            messages.append(msg.model_dump(exclude_none=True))

            if not msg.tool_calls:
                break

            for tool_call in msg.tool_calls:
                fn_name = tool_call.function.name
                fn_args = json.loads(tool_call.function.arguments)

                try:
                    result = await execute_tool(fn_name, fn_args, db)
                except Exception as e:
                    result = {"error": str(e)}

                tool_results_for_context.append({
                    "tool": fn_name,
                    "args": fn_args,
                    "result": result,
                })

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result, default=str),
                })

        final_content = response.choices[0].message.content or "{}"
        content = final_content.strip()
        if content.startswith("```"):
            lines = content.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            content = "\n".join(lines).strip()

        try:
            structured = json.loads(content)
        except json.JSONDecodeError:
            structured = {
                "summary": content[:250] if content else "Analysis generated from business database.",
                "findings": [{"title": "Insights Summary", "detail": content, "evidence": "Extracted from database"}],
                "evidence": [],
                "drivers": [],
                "recommended_actions": ["Compare revenue against prior period", "Examine product sales breakdown"],
                "follow_up_questions": ["What were our top 5 products by revenue?", "Which state drove the highest sales?"],
                "visualizations": [],
            }

        return {
            "structured": structured,
            "tool_results": tool_results_for_context,
            "messages_for_history": messages[-4:],
        }

    except Exception as err:
        # Fallback to direct analytical query execution if LLM call fails or times out
        start, end = resolve_period("this_year")
        comp = await compare_periods(db, (start, end))
        cats = await breakdown_by_dimension(db, "category", start, end, limit=5)

        return {
            "structured": {
                "summary": f"Data Summary: Analyzed '{question}' against the sales database.",
                "findings": [
                    {
                        "title": "Core Revenue Metrics",
                        "detail": f"Total Revenue is ${comp['metrics']['revenue']['current']:,.2f} over the selected reporting period with {comp['metrics']['orders']['current']:,} total orders.",
                        "evidence": f"Period: {comp['current_period']}"
                    }
                ],
                "evidence": [
                    {
                        "metric": "Revenue",
                        "period": comp['current_period'],
                        "current": comp['metrics']['revenue']['current'],
                        "previous": comp['metrics']['revenue']['previous'],
                        "change": f"{comp['metrics']['revenue']['growth_pct']}%" if comp['metrics']['revenue']['growth_pct'] else "N/A"
                    }
                ],
                "drivers": [
                    {"label": c["label"], "impact": f"${c['revenue']:,.2f}", "direction": "up"}
                    for c in cats[:3]
                ],
                "recommended_actions": [
                    "Explore revenue breakdown by country/state",
                    "Identify top performing product categories",
                    "Check customer repeat purchase trends"
                ],
                "follow_up_questions": [
                    "Which product categories generated the most revenue?",
                    "What are the top performing customer countries?",
                    "Show repeat customer behavior metrics"
                ],
                "visualizations": [],
            },
            "tool_results": [],
            "messages_for_history": [],
        }
