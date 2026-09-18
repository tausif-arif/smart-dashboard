from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.core.db import get_db
from app.schemas import AskRequest, AIResponse, EvidenceItem
from app.ai.orchestrator import orchestrate
from app.ai.conversation import create_conversation, get_history, update_conversation
from app.core.config import get_settings

router = APIRouter(prefix="/api", tags=["ask"])
settings = get_settings()


@router.post("/ask", response_model=AIResponse)
async def ask(request: AskRequest, db: AsyncSession = Depends(get_db)):
    if not settings.openai_api_key or settings.openai_api_key == "your-openai-api-key-here":
        raise HTTPException(
            status_code=503,
            detail="OpenAI API key not configured. Please set OPENAI_API_KEY in backend/.env"
        )

    # Get or create conversation
    conv_id = request.conversation_id or create_conversation()
    history = get_history(conv_id)

    try:
        result = await orchestrate(request.question, db, history)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI orchestration failed: {str(e)}")

    structured = result["structured"]

    # Update conversation context
    update_conversation(conv_id, result["messages_for_history"], request.question)

    # Build typed EvidenceItems
    evidence_items = []
    for e in structured.get("evidence", []):
        evidence_items.append(EvidenceItem(
            metric=e.get("metric", ""),
            period=e.get("period", ""),
            comparison=e.get("comparison"),
            segment=e.get("segment"),
            current=e.get("current"),
            previous=e.get("previous"),
            change=e.get("change"),
        ))

    return AIResponse(
        conversation_id=conv_id,
        question=request.question,
        summary=structured.get("summary", ""),
        findings=structured.get("findings", []),
        evidence=evidence_items,
        drivers=structured.get("drivers", []),
        recommended_actions=structured.get("recommended_actions", []),
        follow_up_questions=structured.get("follow_up_questions", []),
        visualizations=structured.get("visualizations", []),
    )


@router.post("/conversations")
async def create_conv():
    cid = create_conversation()
    return {"conversation_id": cid}


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    history = get_history(conversation_id)
    if not history and conversation_id not in []:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"conversation_id": conversation_id, "message_count": len(history)}
