import mlflow
from datetime import datetime
from uuid import uuid4
from src.db.mongo_client import get_db

db = get_db()

def record_metric(metric_data: dict) -> str:
    metric_data["metric_id"] = f"metric_{uuid4().hex}"
    metric_data["timestamp"] = datetime.utcnow().isoformat() + "Z"
    db.MonitoringMetrics.insert_one(metric_data)
    with mlflow.start_run(nested=True):
        mlflow.log_param("metric_id", metric_data["metric_id"])
        mlflow.log_metric("cpu_usage", metric_data.get("cpu_usage", 0))
        mlflow.log_metric("memory_usage", metric_data.get("memory_usage", 0))
        mlflow.log_metric("latency", metric_data.get("latency", 0))
        mlflow.log_metric("user_requests", metric_data.get("user_requests", 0))
    return metric_data["metric_id"]

def get_recent_metrics(limit: int = 10):
    metrics = list(db.MonitoringMetrics.find().sort("timestamp", -1).limit(limit))
    return metrics
