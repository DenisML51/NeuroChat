from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    username: str = Field(..., example="ivan_petrov")
    email: EmailStr = Field(..., example="ivan@example.com")

class UserCreate(UserBase):
    password: str = Field(..., example="secret_password")

class UserInDB(UserBase):
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserOut(UserBase):
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class Message(BaseModel):
    message_id: Optional[str] = Field(None, example="msg_12345")
    session_id: Optional[str] = Field(None, example="sess_67890")
    user_id: Optional[str] = Field(None, example="user_001")
    role: str = Field(..., example="user")
    content: str = Field(..., example="Привет, расскажи о MongoDB?")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Session(BaseModel):
    session_id: Optional[str] = Field(None, example="sess_67890")
    user_id: Optional[str] = Field(None, example="user_001")
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class Log(BaseModel):
    log_id: Optional[str] = Field(None, example="log_98765")
    session_id: Optional[str] = Field(None, example="sess_67890")
    message_id: Optional[str] = Field(None, example="msg_12345")
    processing_time: Optional[float] = Field(None, example=1.25)
    tokens_used: Optional[int] = Field(None, example=45)
    status: str = Field(..., example="success")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    error: Optional[str] = None

class MonitoringMetric(BaseModel):
    metric_id: Optional[str] = Field(None, example="metric_001")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    cpu_usage: float = Field(..., example=45.2)
    memory_usage: float = Field(..., example=68.7)
    latency: float = Field(..., example=0.8)
    user_requests: int = Field(..., example=120)
    additional_info: Dict[str, Any] = Field(default_factory=dict)
