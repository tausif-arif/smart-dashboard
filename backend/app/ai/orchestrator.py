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

settings = get_settings()

SYSTEM_PROMPT = """You are a business intelligence analyst for a retail company.
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
- When comparing periods, always state which periods are being compared

When the user asks about "this month" or "this year", use the period parameter accordingly.
The default period for general questions is "this_year" unless context suggests otherwise.

Return your response as a JSON object with these fields:
{
  "summary": "One sentence summary of the main finding",
  "findings": [{"title": "...", "detail": "...", "evidence": "..."}],
  "evidence": [{"metric": "...", "period": "...", "current": ..., "previous": ..., "change": "..."}],
  "drivers": [{"label": "...", "impact": "...", "direction": "up/down"}],
  "recommended_actions": ["action 1", "action 2"],
  "follow_up_questions": ["question 1", "question 2"],
  "visualizations": [{"type": "trend/breakdown/comparison", "title": "...", "data_key": "..."}]
}
"""


async def orchestrate(
    question: str,
    db: AsyncSession,
    conversation_history: list[dict] = [],
) -> dict:
    """
    Run the full LLM orchestration loop:
    1. Send question + history to OpenAI with tools
    2. Execute any tool calls
    3. Send results back to LLM
    4. Return structured response
    """
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

    # Agentic loop — up to 5 tool-call rounds
    for _ in range(5):
        response = await client.chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            tools=TOOL_SCHEMAS,
            tool_choice="auto",
        )

        msg = response.choices[0].message
        messages.append(msg.model_dump(exclude_none=True))

        if not msg.tool_calls:
            # LLM is done calling tools — parse final answer
            break

        # Execute each tool call
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

    # Parse the final LLM response
    final_content = response.choices[0].message.content or "{}"
    try:
        # Strip markdown code blocks if present
        content = final_content.strip()
        if content.startswith("```"):
            content = "\n".join(content.split("\n")[1:])
        if content.endswith("```"):
            content = "\n".join(content.split("\n")[:-1])
        structured = json.loads(content)
    except json.JSONDecodeError:
        # LLM returned plain text — wrap it
        structured = {
            "summary": final_content[:200],
            "findings": [{"title": "Analysis", "detail": final_content, "evidence": "Based on analytics tools"}],
            "evidence": [],
            "drivers": [],
            "recommended_actions": [],
            "follow_up_questions": [],
            "visualizations": [],
        }

    return {
        "structured": structured,
        "tool_results": tool_results_for_context,
        "messages_for_history": messages[-4:],  # Keep last 4 for context
    }
