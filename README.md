## SOPAS (Student Organization Project Approval) 

A simple submission system with roles (student/admin) built using FastAPI (backend) and Streamlit (frontend), with MongoDB for data storage.

## Team Members
1. [Mariette Sai Joy S. Bacalso](https://github.com/SaiBacalso) 
2. [Joshua Argel Detchaca](https://github.com/Joshua-Detchaca)
3. [Florie Ann Madrono](https://github.com/fcmadrono1203)
4. [Mary Angeli Talian](https://github.com/MaryAngeliTalian)

- ### Features
  - User authentication with roles (student/admin)
  - Students can create and edit submissions (only when status is pending)
  - Admins can view all submissions, add comments, and update status (approved/revision)
  - Simple and maintainable with few files

- ### Requirements
  - Python 3.8+
  - MongoDB (running locally on default port 27017)

- ### Installation
  - 1. Clone or download the project files.
  - 2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
  - 3. Ensure MongoDB is running locally.

- ### Running the Application
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

- ### Usage
  1. Register as a student or admin.
  2. Login with your credentials.
  3. Students: Create submissions, edit them if pending.
  4. Admins: View all submissions, add comments, change status.

- ### API Endpoints
  - POST /register: Register a new user
  - POST /login: Login and get access token
  - POST /submissions: Create a submission (student only)
  - GET /submissions: Get submissions (own for students, all for admins)
  - PUT /submissions/{id}: Update submission (student, own, pending only)
  - POST /submissions/{id}/comment: Add comment (admin only)
  - PUT /submissions/{id}/status: Update status (admin only)

- ### Files
  - `main.py`: FastAPI backend
  - `app.py`: Streamlit frontend
  - `requirements.txt`: Python dependencies
  - `README.md`: This file

### MILESTONE 1: PROJECT INITIATION & PLANNING

- **What you’ll do:**  
  - Define the overall project concept and scope.  
  - Gather initial functional and non-functional requirements.  
  - Research tools, frameworks, and assess feasibility.  
  - Plan project timeline, workload distribution, and required resources.  
  - Outline the high-level system architecture (front-end, back-end,      database).
- **Deliverables:**  
  - Clear project scope statement  
  - Initial requirements document (basic features + constraints)  
  - Tool/technology feasibility report  
  - Preliminary project timeline and resource plan  
  - Initial system architecture diagram or outline  
- **Checklist:**
  - [ ] Define project topic and scope  
  - [ ] Collect initial requirements  
  - [ ] Research tools/frameworks (Flask, SQLite, etc.)  
  - [ ] Create initial timeline & resource plan  
  - [ ] Draft high-level system architecture  
  - [ ] Commit planning documents to GitHub  

### MILESTONE 2: REQUIREMENTS & DESIGN

- **What you’ll do:**
  - Finalize detailed system requirements (functional & non-functional).  
  - Define user roles such as Student and Admin and their permissions.  
  - Design the complete system architecture (front-end, API, database, authentication flow).  
  - Design the database schema for core entities.  
  - Plan API endpoints, including request/response formats and security considerations.
- **Deliverables:**
  - Detailed requirements specification document  
  - User roles & access control descriptions  
  - System architecture diagram (backend flow, database, API layers)  
  - Database schema design (tables, relationships, keys)  
  - API endpoint list with basic definitions and security notes  
- **Checklist:**
  - [ ] Finalize detailed requirements  
  - [ ] Define Student/Admin roles and permissions  
  - [ ] Create full system architecture design  
  - [ ] Design database schema  
  - [ ] Plan API endpoints + security considerations  
  - [ ] Update documentation and push to GitHub  

### MILESTONE 3: DEVELOPMENT

- **What you’ll do:**  
  - Develop the backend API using FastAPI to handle core application logic and endpoints.  
  - Set up and integrate MongoDB for data storage and retrieval.  
  - Implement authentication using JWT to secure user access and sessions.  
  - Build CRUD operations with proper role-based access control to manage permissions for different user roles.  
  - Develop the frontend using Streamlit to provide a functional and interactive user interface.
- **Deliverables:**  
  - Functional FastAPI backend with defined API endpoints  
  - Configured and integrated MongoDB database  
  - JWT-based authentication implementation  
  - CRUD operations with role-based access control  
  - Streamlit frontend connected to the backend API  
- **Checklist:**  
  - [ ] Develop backend API (FastAPI)  
  - [ ] Setup and integrate MongoDB  
  - [ ] Implement authentication (JWT)  
  - [ ] CRUD operations and role-based access  
  - [ ] Develop frontend (Streamlit)  
  - [ ] Commit and push changes to GitHub

### MILESTONE 4: TESTING

- **What you’ll do:**
  - Perform unit and integration testing on system components.  
  - Test authentication mechanisms, CRUD functionality, user roles, and database operations.  
  - Conduct error handling and edge case testing to ensure system stability.
- **Deliverables:**
  - Unit and integration test cases and results  
  - Verified authentication, CRUD, role, and database functionality  
  - Error and edge case test report  
- **Checklist:**
  - [ ] Unit and integration testing  
  - [ ] Test authentication, CRUD, roles, database  
  - [ ] Error and edge case testing  
  - [ ] Fix identified issues  
  - [ ] Commit test results to GitHub 

### MILESTONE 5: DEPLOYMENT & DOCUMENTATION

- **What you’ll do:**  
  - Deploy the system to a production environment and configure all required services and settings.  
  - Conduct final testing to ensure the system is stable, secure, and functioning as expected.  
  - Create complete user, API, and code documentation to support usage, maintenance, and future development.  
  - Prepare the project presentation and complete all required submission materials.
- **Deliverables:**  
  - Deployed and fully configured production system  
  - Completed final testing results and bug fixes  
  - User guide, API documentation, and code comments  
  - Final project presentation and submission files  
- **Checklist:**  
  - [ ] Deploy system and configure production  
  - [ ] Final testing  
  - [ ] Create user, API, and code documentation  
  - [ ] Project presentation and submission  
  - [ ] Commit and push final changes to GitHub


