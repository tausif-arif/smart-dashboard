"""
Conversation session management — in-memory store for multi-turn Ask sessions.
In production, replace with Redis or DB-backed sessions.
"""
import uuid
from typing import Optional


# In-memory conversation store (replace with Redis/DB for production scale)
_conversations: dict[str, dict] = {}


def create_conversation() -> str:
    cid = str(uuid.uuid4())
    _conversations[cid] = {"id": cid, "history": [], "question_count": 0}
    return cid


def get_conversation(cid: str) -> Optional[dict]:
    return _conversations.get(cid)


def update_conversation(cid: str, new_messages: list[dict], question: str) -> None:
    if cid not in _conversations:
        _conversations[cid] = {"id": cid, "history": [], "question_count": 0}
    _conversations[cid]["history"].extend(new_messages)
    _conversations[cid]["question_count"] += 1
    # Keep last 20 messages to prevent token overflow
    _conversations[cid]["history"] = _conversations[cid]["history"][-20:]


def get_history(cid: str) -> list[dict]:
    conv = _conversations.get(cid)
    if not conv:
        return []
    return conv.get("history", [])
