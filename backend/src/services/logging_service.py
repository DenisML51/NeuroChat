import mlflow
from datetime import datetime
from uuid import uuid4
from src.db.mongo_client import get_db

db = get_db()

def log_event(log_data: dict) -> str:
    log_data["log_id"] = f"log_{uuid4().hex}"
    log_data["timestamp"] = datetime.utcnow().isoformat() + "Z"
    db.Logs.insert_one(log_data)
    with mlflow.start_run(nested=True):
        mlflow.log_param("log_id", log_data["log_id"])
        mlflow.log_param("session_id", log_data.get("session_id", ""))
        mlflow.log_param("message_id", log_data.get("message_id", ""))
        mlflow.log_metric("processing_time", log_data.get("processing_time", 0))
        mlflow.log_metric("tokens_used", log_data.get("tokens_used", 0))
        mlflow.log_param("status", log_data.get("status", ""))
    return log_data["log_id"]
