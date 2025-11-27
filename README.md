# SOPAS (Student Organization Project Approval) 

A simple submission system with roles (student/admin) built using FastAPI (backend) and Streamlit (frontend), with MongoDB for data storage.

# Team Members
- Mariette Sai Joy S. Bacalso
- Joshua Argel Detchaca
- Florie Ann Madrono
- Mary Angeli Talian

## Features

- User authentication with roles (student/admin)
- Students can create and edit submissions (only when status is pending)
- Admins can view all submissions, add comments, and update status (approved/revision)
- Simple and maintainable with few files

## Requirements

- Python 3.8+
- MongoDB (running locally on default port 27017)

## Installation

1. Clone or download the project files.
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Ensure MongoDB is running locally.

## Running the Application

1. Start the FastAPI backend:
   ```
   uvicorn main:app --reload
   ```
   This will start the backend on http://localhost:8000

2. In a new terminal, start the Streamlit frontend:
   ```
   streamlit run frontend.py
   ```
   This will open the frontend in your browser.

## Usage

1. Register as a student or admin.
2. Login with your credentials.
3. Students: Create submissions, edit them if pending.
4. Admins: View all submissions, add comments, change status.

## API Endpoints

- POST /register: Register a new user
- POST /login: Login and get access token
- POST /submissions: Create a submission (student only)
- GET /submissions: Get submissions (own for students, all for admins)
- PUT /submissions/{id}: Update submission (student, own, pending only)
- POST /submissions/{id}/comment: Add comment (admin only)
- PUT /submissions/{id}/status: Update status (admin only)

## Files

- `main.py`: FastAPI backend
- `app.py`: Streamlit frontend
- `requirements.txt`: Python dependencies
- `README.md`: This file
