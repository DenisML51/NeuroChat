import os
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
import jwt

from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from src.db.mongo_client import get_db
from src.models import schemas

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_secret_key_here")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def register_user(user: schemas.UserCreate):
    db = get_db()
    if db.Users.find_one({"username": user.username}) or db.Users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="User with this username or email already exists")
    hashed_password = get_password_hash(user.password)
    user_doc = {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    db.Users.insert_one(user_doc)
    return {"username": user.username, "email": user.email, "created_at": user_doc["created_at"]}

def authenticate_user(username: str, password: str):
    db = get_db()
    user_doc = db.Users.find_one({"username": username})
    if not user_doc:
        return False
    if not verify_password(password, user_doc["hashed_password"]):
        return False
    return user_doc

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    db = get_db()
    user_doc = db.Users.find_one({"username": username})
    if user_doc is None:
        raise HTTPException(status_code=404, detail="User not found")
    return schemas.UserOut(**user_doc)
