import time
from datetime import datetime
from uuid import uuid4

from src.db.mongo_client import get_db

db = get_db()

def create_session(session_data: dict) -> str:
    session_data["session_id"] = f"sess_{uuid4().hex}"
    session_data["start_time"] = datetime.utcnow().isoformat() + "Z"
    session_data.setdefault("metadata", {})
    db.Sessions.insert_one(session_data)
    return session_data["session_id"]

def save_message(message: dict) -> str:
    message["message_id"] = f"msg_{int(time.time() * 1000)}"
    message["timestamp"] = datetime.utcnow().isoformat() + "Z"
    db.Messages.insert_one(message)
    return message["message_id"]

def get_session_messages(session_id: str):
    messages = list(db.Messages.find({"session_id": session_id}).sort("timestamp", 1))
    return messages

def get_chat_context(session_id: str) -> str:
    """
    Возвращает историю диалога в виде единого текста.
    Формат: «User: ...\nBot: ...\nUser: ...»
    """
    messages = get_session_messages(session_id)
    context_lines = []
    for msg in messages:
        role = "User" if msg.get("role") == "user" else "Bot"
        context_lines.append(f"{role}: {msg.get('content')}")
    return "\n".join(context_lines)
