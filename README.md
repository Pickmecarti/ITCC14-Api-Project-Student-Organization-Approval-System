# ITCC14-Api-Project-Student-Organization-Approval-System

Members
1. Name
2. Joshua Argel Detchaca 
3. Florie Ann Madrono
4. Mary Angeli Talian

Milestone 1 (Nov Week 1): Project Proposal & Introduction

### **What We’ll Do**

This week, our team will finalize the core functions and user roles for the Student Organization Project Approval System (SOPAS). We will define the database schema for proposals, status updates, and comments, and begin drafting the API structure using FastAPI. We will also set up the initial project repository with a clear documentation structure and plan our development milestones.

### **Deliverables**

- An updated **README.md** file including:
  - Problem Statement
  - User Roles (Student, SACDEV Staff)
  - Data Models (Proposal, Status, Comment)
  - API Endpoints Overview
- A **models.py** file defining the MongoDB document structures
- An **api.yaml** or **openapi.json** file outlining the planned endpoints
- Initial **app.py** skeleton with FastAPI setup

### **Checklists**

- [ ] Hold a team meeting to finalize project scope and user stories
- [ ] Define data models for:
  - [ ] Proposal (org_name, project_title, document_link, status, revision_history)
  - [ ] Status (e.g., Submitted, Under Review, Approved, Needs Revision, Disapproved)
  - [ ] Comment (proposal_id, comment_text, timestamp, author)
- [ ] Draft API endpoints in **api.yaml** (OpenAPI format)
- [ ] Set up GitHub repository with initial FastAPI structure
- [ ] Create and commit **models.py** with Pydantic/MongoDB models
- [ ] Write and commit a basic **app.py** with one test endpoint
- [ ] Update **README.md** with all agreed-upon sections

### **Suggested Tech Stack Details**

- **Backend**: Python + FastAPI
- **Database**: MongoDB
- **Version Control**: Git + GitHub
- **Documentation**: OpenAPI (via FastAPI auto-docs)

Milestone 2 (Nov Week 2): Half API + Half Documentation + Git/GitHub
