import streamlit as st
import requests
import json

# API base URL
API_URL = "http://localhost:8000"

st.title("Submission System")

# Session state for authentication
if 'token' not in st.session_state:
    st.session_state.token = None
if 'role' not in st.session_state:
    st.session_state.role = None

def login(username, password):
    response = requests.post(f"{API_URL}/login", json={"username": username, "password": password})
    if response.status_code == 200:
        data = response.json()
        st.session_state.token = data['access_token']
        # Get role
        headers = {"Authorization": f"Bearer {st.session_state.token}"}
        me_response = requests.get(f"{API_URL}/me", headers=headers)
        if me_response.status_code == 200:
            me_data = me_response.json()
            st.session_state.role = me_data['role']
            return True
    return False

def register(username, password, role):
    response = requests.post(f"{API_URL}/register", json={"username": username, "password": password, "role": role})
    return response.status_code == 200

def create_submission(title, content):
    headers = {"Authorization": f"Bearer {st.session_state.token}"}
    response = requests.post(f"{API_URL}/submissions", json={"title": title, "content": content}, headers=headers)
    return response.status_code == 200

def get_submissions():
    headers = {"Authorization": f"Bearer {st.session_state.token}"}
    response = requests.get(f"{API_URL}/submissions", headers=headers)
    if response.status_code == 200:
        return response.json()
    return []

def update_submission(sub_id, title, content):
    headers = {"Authorization": f"Bearer {st.session_state.token}"}
    response = requests.put(f"{API_URL}/submissions/{sub_id}", json={"title": title, "content": content}, headers=headers)
    return response.status_code == 200

def add_comment(sub_id, comment):
    headers = {"Authorization": f"Bearer {st.session_state.token}"}
    response = requests.post(f"{API_URL}/submissions/{sub_id}/comment", json={"comment": comment}, headers=headers)
    return response.status_code == 200

def update_status(sub_id, status):
    headers = {"Authorization": f"Bearer {st.session_state.token}"}
    response = requests.put(f"{API_URL}/submissions/{sub_id}/status", json={"status": status}, headers=headers)
    return response.status_code == 200

if not st.session_state.token:
    tab1, tab2 = st.tabs(["Login", "Register"])

    with tab1:
        st.header("Login")
        username = st.text_input("Username", key="login_username")
        password = st.text_input("Password", type="password", key="login_password")
        if st.button("Login"):
            if login(username, password):
                st.success("Logged in successfully!")
                st.rerun()
            else:
                st.error("Login failed")

    with tab2:
        st.header("Register")
        reg_username = st.text_input("Username", key="reg_username")
        reg_password = st.text_input("Password", type="password", key="reg_password")
        role = st.selectbox("Role", ["student", "admin"])
        if st.button("Register"):
            if register(reg_username, reg_password, role):
                st.success("Registered successfully! Please login.")
            else:
                st.error("Registration failed")
else:
    st.write(f"Welcome, {st.session_state.role}!")
    if st.button("Logout"):
        st.session_state.token = None
        st.session_state.role = None
        st.rerun()

    if st.session_state.role == "student":
        st.header("Create Submission")
        title = st.text_input("Title")
        content = st.text_area("Content")
        if st.button("Submit"):
            if create_submission(title, content):
                st.success("Submission created!")
                st.rerun()
            else:
                st.error("Failed to create submission")

    st.header("Submissions")
    submissions = get_submissions()
    for sub in submissions:
        with st.expander(f"{sub['title']} - {sub['status']}"):
            st.write(f"Content: {sub['content']}")
            st.write("Comments:")
            for comment in sub.get('comments', []):
                st.write(f"- {comment['comment']} by {comment['admin_id']}")

            if st.session_state.role == "student" and sub['status'] == "pending":
                if st.button(f"Edit {sub['_id']}", key=f"edit_{sub['_id']}"):
                    st.session_state.edit_id = sub['_id']
                if 'edit_id' in st.session_state and st.session_state.edit_id == sub['_id']:
                    new_title = st.text_input("New Title", value=sub['title'], key=f"title_{sub['_id']}")
                    new_content = st.text_area("New Content", value=sub['content'], key=f"content_{sub['_id']}")
                    if st.button("Update", key=f"update_{sub['_id']}"):
                        if update_submission(sub['_id'], new_title, new_content):
                            st.success("Updated!")
                            del st.session_state.edit_id
                            st.rerun()
                        else:
                            st.error("Update failed")

            if st.session_state.role == "admin":
                comment = st.text_input(f"Add comment to {sub['_id']}", key=f"comment_{sub['_id']}")
                if st.button(f"Add Comment {sub['_id']}", key=f"add_comment_{sub['_id']}"):
                    if add_comment(sub['_id'], comment):
                        st.success("Comment added!")
                        st.rerun()
                    else:
                        st.error("Failed to add comment")

                status = st.selectbox(f"Update status for {sub['_id']}", ["approved", "revision"], key=f"status_{sub['_id']}")
                if st.button(f"Update Status {sub['_id']}", key=f"update_status_{sub['_id']}"):
                    if update_status(sub['_id'], status):
                        st.success("Status updated!")
                        st.rerun()
                    else:
                        st.error("Failed to update status")
