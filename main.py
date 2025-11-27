from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os

app = FastAPI()

# MongoDB connection
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["submission_system"]

# Security
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Models
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

class Comment(BaseModel):
    comment: str

class StatusUpdate(BaseModel):
    status: str  # "approved" or "revision"

# Helper functions
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

# Routes
@app.post("/register")
async def register(user: User):
    if await db.users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    user_dict = {"username": user.username, "password": hashed_password, "role": user.role}
    await db.users.insert_one(user_dict)
    return {"message": "User registered successfully"}

@app.post("/login")
async def login(user: LoginUser):
    db_user = await db.users.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/submissions")
async def create_submission(submission: Submission, current_user: str = Depends(get_current_user)):
    role = await get_user_role(current_user)
    if role != "student":
        raise HTTPException(status_code=403, detail="Only students can create submissions")
    submission_dict = {
        "student_id": current_user,
        "title": submission.title,
        "content": submission.content,
        "status": "pending",
        "comments": [],
        "created_at": datetime.utcnow()
    }
    result = await db.submissions.insert_one(submission_dict)
    return {"id": str(result.inserted_id)}

@app.get("/submissions")
async def get_submissions(current_user: str = Depends(get_current_user)):
    role = await get_user_role(current_user)
    if role == "admin":
        submissions = await db.submissions.find().to_list(100)
    else:
        submissions = await db.submissions.find({"student_id": current_user}).to_list(100)
    for sub in submissions:
        sub["_id"] = str(sub["_id"])
    return submissions

@app.put("/submissions/{submission_id}")
async def update_submission(submission_id: str, submission: Submission, current_user: str = Depends(get_current_user)):
    role = await get_user_role(current_user)
    db_submission = await db.submissions.find_one({"_id": submission_id, "student_id": current_user})
    if not db_submission:
        raise HTTPException(status_code=404, detail="Submission not found or not owned by user")
    if db_submission["status"] != "pending":
        raise HTTPException(status_code=400, detail="Cannot edit non-pending submission")
    await db.submissions.update_one({"_id": submission_id}, {"$set": {"title": submission.title, "content": submission.content}})
    return {"message": "Submission updated"}

@app.post("/submissions/{submission_id}/comment")
async def add_comment(submission_id: str, comment: Comment, current_user: str = Depends(get_current_user)):
    role = await get_user_role(current_user)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can add comments")
    comment_dict = {
        "admin_id": current_user,
        "comment": comment.comment,
        "timestamp": datetime.utcnow()
    }
    await db.submissions.update_one({"_id": submission_id}, {"$push": {"comments": comment_dict}})
    return {"message": "Comment added"}

@app.put("/submissions/{submission_id}/status")
async def update_status(submission_id: str, status_update: StatusUpdate, current_user: str = Depends(get_current_user)):
    role = await get_user_role(current_user)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update status")
    if status_update.status not in ["approved", "revision"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    await db.submissions.update_one({"_id": submission_id}, {"$set": {"status": status_update.status}})
    return {"message": "Status updated"}

@app.get("/me")
async def get_me(current_user: str = Depends(get_current_user)):
    role = await get_user_role(current_user)
    return {"username": current_user, "role": role}

# Mount static files
app.mount("/", StaticFiles(directory=".", html=True), name="static")
