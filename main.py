# Import necessary modules and models from models.py
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.staticfiles import StaticFiles
from bson import ObjectId
from datetime import datetime, timedelta
import uvicorn
from models import (
    User, LoginUser, Submission, Comment, StatusUpdate,
    verify_password, get_password_hash, create_access_token,
    get_current_user, get_user_role, ACCESS_TOKEN_EXPIRE_MINUTES, db
)

# Create FastAPI app with tags for documentation
app = FastAPI(
    openapi_tags=[
        {
            "name": "Authentication & Users",
            "description": "Operations related to user registration, login, and user information.",
        },
        {
            "name": "Create and Read Submissions",
            "description": "Endpoints for creating new submissions and retrieving existing ones.",
        },
        {
            "name": "Update Submissions",
            "description": "Endpoints for updating submission details and status.",
        },
        {
            "name": "Add Comment",
            "description": "Endpoints for adding comments to submissions.",
        },
        {
            "name": "Delete",
            "description": "Endpoints for deleting submissions.",
        },
    ]
)

# API Endpoints (Routes)

# User registration endpoint
@app.post("/register", tags=["Authentication & Users"])
async def register(user: User):
    if await db.users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    user_dict = {"username": user.username, "password": hashed_password, "role": user.role}
    await db.users.insert_one(user_dict)
    return {"message": "User registered successfully"}

# User login endpoint
@app.post("/login", tags=["Authentication & Users"])
async def login(user: LoginUser):
    db_user = await db.users.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# Create new submission (students only)
@app.post("/submissions", tags=["Create and Read Submissions"])
async def create_submission(submission: Submission, current_user: str = Depends(get_current_user)):
    role = await get_user_role(current_user)
    if role != "student":
        raise HTTPException(status_code=403, detail="Only students can create submissions")
    submission_dict = {
        "student_id": current_user,
        "title": submission.title,
        "content": submission.content,
        "project_head": submission.project_head,
        "budget": submission.budget,
        "venue": submission.venue,
        "organization_name": submission.organization_name,
        "event_datetime": f"{submission.event_date} {submission.event_time}",
        "status": "pending",
        "comments": [],
        "created_at": datetime.utcnow()
    }
    result = await db.submissions.insert_one(submission_dict)
    return {"id": str(result.inserted_id)}

# Get submissions (admins see all, students see their own)
@app.get("/submissions", tags=["Create and Read Submissions"])
async def get_submissions(current_user: str = Depends(get_current_user)):
    role = await get_user_role(current_user)
    if role == "admin":
        submissions = await db.submissions.find().to_list(100)
    else:
        submissions = await db.submissions.find({"student_id": current_user}).to_list(100)
    for sub in submissions:
        sub["_id"] = str(sub["_id"])
    return submissions

# Update submission details (students only, their own)
@app.put("/submissions/{submission_id}", tags=["Update Submissions"])
async def update_submission(
    submission_id: str,
    submission: Submission,
    current_user: str = Depends(get_current_user)
):
    role = await get_user_role(current_user)
    if role != "student":
        raise HTTPException(status_code=403, detail="Only students can update submissions")

    try:
        oid = ObjectId(submission_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid submission ID")

    db_submission = await db.submissions.find_one(
        {"_id": oid, "student_id": current_user}
    )
    if not db_submission:
        raise HTTPException(status_code=404, detail="Submission not found or not owned by user")

    await db.submissions.update_one(
        {"_id": oid},
        {"$set": {
            "title": submission.title,
            "content": submission.content,
            "project_head": submission.project_head,
            "budget": submission.budget,
            "venue": submission.venue,
            "organization_name": submission.organization_name,
            "event_datetime": f"{submission.event_date} {submission.event_time}"
        }}
    )

    return {"message": "Submission updated"}

# Add comment to submission (admins only)
@app.post("/submissions/{submission_id}/comment", tags=["Add Comment"])
async def add_comment(submission_id: str, comment: Comment, current_user: str = Depends(get_current_user)):
    role = await get_user_role(current_user)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can add comments")
    try:
        oid = ObjectId(submission_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid submission ID")
    comment_dict = {
        "admin_id": current_user,
        "comment": comment.comment,
        "timestamp": datetime.utcnow()
    }
    await db.submissions.update_one({"_id": oid}, {"$push": {"comments": comment_dict}})
    return {"message": "Comment added"}

# Update submission status (admins only)
@app.put("/submissions/{submission_id}/status", tags=["Update Submissions"])
async def update_status(submission_id: str, status_update: StatusUpdate, current_user: str = Depends(get_current_user)):
    role = await get_user_role(current_user)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update status")
    if status_update.status not in ["approved", "revision"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    try:
        oid = ObjectId(submission_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid submission ID")
    await db.submissions.update_one({"_id": oid}, {"$set": {"status": status_update.status}})
    return {"message": "Status updated"}

# Delete submission (students only, their own)
@app.delete("/submissions/{submission_id}", tags=["Delete"])
async def delete_submission(submission_id: str, current_user: str = Depends(get_current_user)):
    role = await get_user_role(current_user)
    if role != "student":
        raise HTTPException(status_code=403, detail="Only students can delete submissions")
    try:
        oid = ObjectId(submission_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid submission ID")
    db_submission = await db.submissions.find_one({"_id": oid, "student_id": current_user})
    if not db_submission:
        raise HTTPException(status_code=404, detail="Submission not found or not owned by user")
    await db.submissions.delete_one({"_id": oid})
    return {"message": "Submission deleted"}

# Get current user info
@app.get("/me", tags=["Authentication & Users"])
async def get_me(current_user: str = Depends(get_current_user)):
    role = await get_user_role(current_user)
    return {"username": current_user, "role": role}

# Serve static files (for frontend)
app.mount("/", StaticFiles(directory=".", html=True), name="static")

# Run the app with uvicorn when executed directly
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8888, reload=True)