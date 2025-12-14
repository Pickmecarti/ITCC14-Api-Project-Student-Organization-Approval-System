from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

# MongoDB connection
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["submission_system"]

# Security
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Data models using Pydantic
class User(BaseModel):
    username: str
    password: str
    role: str  # "student" or "admin"

class LoginUser(BaseModel):
    username: str
    password: str

class Submission(BaseModel):
    title: str
    content: str
    project_head: str
    budget: int
    venue: str
    organization_name: str
    event_date: str
    event_time: str

class Comment(BaseModel):
    comment: str

class StatusUpdate(BaseModel):
    status: str  # "approved" or "revision"

# Helper functions for authentication and user management
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_user_role(username: str):
    user = await db.users.find_one({"username": username})
    return user["role"] if user else None