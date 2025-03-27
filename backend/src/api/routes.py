from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from src.models import schemas
from src.services import auth_service, chat_service, llm_service, logging_service, monitoring_service

router = APIRouter()

@router.post("/auth/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate):
    created_user = auth_service.register_user(user)
    return created_user

@router.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    access_token = auth_service.create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/chat/session", response_model=dict)
def create_chat_session(session: schemas.Session, current_user: schemas.UserOut = Depends(auth_service.get_current_user)):
    session.user_id = current_user.username
    session_id = chat_service.create_session(session.dict())
    return {"session_id": session_id}

@router.post("/chat/message", response_model=dict)
def post_message(message: schemas.Message, current_user: schemas.UserOut = Depends(auth_service.get_current_user)):
    message.user_id = current_user.username
    user_msg_id = chat_service.save_message(message.dict())

    context = chat_service.get_chat_context(message.session_id)
    bot_response_text = llm_service.generate_response(context, message.content)

    bot_message = {
        "session_id": message.session_id,
        "user_id": "bot",
        "role": "bot",
        "content": bot_response_text,
    }
    bot_msg_id = chat_service.save_message(bot_message)

    # Логирование события с использованием MLFlow
    logging_service.log_event({
        "session_id": message.session_id,
        "message_id": user_msg_id,
        "processing_time": 0.5,
        "tokens_used": 0,
        "status": "success"
    })

    return {"status": "success", "user_message_id": user_msg_id, "bot_message_id": bot_msg_id}

@router.get("/chat/session/{session_id}", response_model=dict)
def get_session_history(session_id: str, current_user: schemas.UserOut = Depends(auth_service.get_current_user)):
    messages = chat_service.get_session_messages(session_id)
    if not messages:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"session_id": session_id, "messages": messages}

@router.post("/monitoring/metrics", response_model=dict)
def add_metric(metric: schemas.MonitoringMetric):
    metric_id = monitoring_service.record_metric(metric.dict())
    return {"status": "success", "metric_id": metric_id}

@router.get("/monitoring/metrics", response_model=dict)
def get_metrics(limit: int = 10):
    metrics = monitoring_service.get_recent_metrics(limit)
    return {"metrics": metrics}

@router.get("/monitoring/logs", response_model=dict)
def get_logs(limit: int = 10, current_user: schemas.UserOut = Depends(auth_service.get_current_user)):
    db = auth_service.get_db()
    logs = list(db.Logs.find().sort("timestamp", -1).limit(limit))
    return {"logs": logs}
