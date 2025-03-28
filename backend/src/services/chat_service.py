import time
from datetime import datetime
from uuid import uuid4
from bson import ObjectId
from typing import List, Dict
from src.db.mongo_client import get_db

db = get_db()

def convert_objectid(data):
    if isinstance(data, dict):
        return {k: convert_objectid(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_objectid(item) for item in data]
    elif isinstance(data, ObjectId):
        return str(data)
    else:
        return data

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
    return convert_objectid(messages)


def get_chat_context(session_id: str) -> list:
    """
    Возвращает список сообщений из сессии.
    В примере ограничиваемся последними 5 сообщениями.
    """
    messages = get_session_messages(session_id)
    # Допустим, берём только последние 5 сообщений
    messages = messages[-5:]
    validated_messages = []
    for msg in messages:
        if not isinstance(msg, dict):
            continue
        if "role" not in msg or "content" not in msg:
            continue
        validated_messages.append({
            "role": msg["role"],
            "content": str(msg["content"])[:300]
        })
    return validated_messages


def get_session(session_id: str):
    session = db.Sessions.find_one({"session_id": session_id})
    if session:
        return convert_objectid(session)
    return session

def list_sessions(username: str):
    sessions = list(db.Sessions.find({"user_id": username}))
    sessions = convert_objectid(sessions)
    transformed = []
    for sess in sessions:
        title = sess.get("metadata", {}).get("title", sess.get("session_id"))
        transformed.append({
            "session_id": sess.get("session_id"),
            "title": title,
            "start_time": sess.get("start_time")
        })
    return transformed

def update_session_title(session_id: str, title: str):
    db.Sessions.update_one(
        {"session_id": session_id},
        {"$set": {"metadata.title": title}},
        upsert=True  # Добавляем возможность создания поля при отсутствии
    )


def delete_session(session_id: str) -> int:
    """
    Удаляет сессию из коллекции Sessions.
    Возвращает количество удалённых документов.
    """
    result = db.Sessions.delete_one({"session_id": session_id})
    return result.deleted_count

def delete_session_messages(session_id: str) -> int:
    """
    Удаляет все сообщения, связанные с указанной сессией, из коллекции Messages.
    Возвращает количество удалённых документов.
    """
    result = db.Messages.delete_many({"session_id": session_id})
    return result.deleted_count

