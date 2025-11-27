import streamlit as st
import requests
import json

# Backend URL
BACKEND_URL = "http://localhost:8000"

st.title("Submission System")

# Session state
if 'token' not in st.session_state:
    st.session_state.token = None
if 'role' not in st.session_state:
    st.session_state.role = None
if 'username' not in st.session_state:
    st.session_state.username = None

def api_call(method, endpoint, data=None, headers=None):
    url = f"{BACKEND_URL}{endpoint}"
    if headers is None:
        headers = {}
    if st.session_state.token:
        headers['Authorization'] = f"Bearer {st.session_state.token}"
    headers['Content-Type'] = 'application/json'
    if method == 'GET':
        response = requests.get(url, headers=headers)
    elif method == 'POST':
        response = requests.post(url, data=json.dumps(data), headers=headers)
    elif method == 'PUT':
        response = requests.put(url, data=json.dumps(data), headers=headers)
    return response

# Login/Register
if st.session_state.token is None:
    tab1, tab2 = st.tabs(["Login", "Register"])

    with tab1:
        st.header("Login")
        username = st.text_input("Username", key="login_username")
        password = st.text_input("Password", type="password", key="current_password")
        if st.button("Login"):
            response = api_call('POST', '/login', {"username": username, "password": password})
            if response.status_code == 200:
                data = response.json()
                st.session_state.token = data['access_token']
                # Get role
                me_response = api_call('GET', '/me')
                if me_response.status_code == 200:
                    me_data = me_response.json()
                    st.session_state.role = me_data['role']
                    st.session_state.username = me_data['username']
                    st.success("Logged in successfully!")
                    st.rerun()
                else:
                    st.error(f"Failed to get user info: {me_response.status_code} - {me_response.text}")
            else:
                st.error(f"Login failed: {response.status_code} - {response.text}")

    with tab2:
        st.header("Register")
        reg_username = st.text_input("Username", key="reg_username")
        reg_password = st.text_input("Password", type="password", key="reg_password")
        reg_role = st.selectbox("Role", ["student", "admin"], key="reg_role")
        if st.button("Register"):
            response = api_call('POST', '/register', {"username": reg_username, "password": reg_password, "role": reg_role})
            if response.status_code == 200:
                st.success("Registered successfully! Please login.")
            else:
                st.error("Registration failed")

else:
    st.write(f"Logged in as {st.session_state.username} ({st.session_state.role})")
    if st.button("Logout"):
        st.session_state.token = None
        st.session_state.role = None
        st.session_state.username = None
        st.rerun()

    # Submissions
    st.header("Submissions")

    # Create submission (students only)
    if st.session_state.role == "student":
        st.subheader("Create New Submission")
        title = st.text_input("Title")
        content = st.text_area("Content")
        if st.button("Submit"):
            response = api_call('POST', '/submissions', {"title": title, "content": content})
            if response.status_code == 200:
                st.success("Submission created!")
                st.rerun()
            else:
                st.error("Failed to create submission")

    # Load submissions
    response = api_call('GET', '/submissions')
    if response.status_code == 200:
        submissions = response.json()
        for sub in submissions:
            with st.expander(f"{sub['title']} - {sub['status']}"):
                st.write(f"Content: {sub['content']}")
                st.write(f"Status: {sub['status']}")
                if sub['comments']:
                    st.write("Comments:")
                    for comment in sub['comments']:
                        st.write(f"- {comment['comment']} (by {comment['admin_id']})")

                # Edit (students, pending only)
                if st.session_state.role == "student" and sub['status'] == "pending" and sub['student_id'] == st.session_state.username:
                    with st.form(key=f"edit_{sub['_id']}"):
                        new_title = st.text_input("New Title", value=sub['title'])
                        new_content = st.text_area("New Content", value=sub['content'])
                        if st.form_submit_button("Update"):
                            edit_response = api_call('PUT', f"/submissions/{sub['_id']}", {"title": new_title, "content": new_content})
                            if edit_response.status_code == 200:
                                st.success("Updated!")
                                st.rerun()
                            else:
                                st.error("Update failed")

                # Admin functions
                if st.session_state.role == "admin":
                    # Add comment
                    with st.form(key=f"comment_{sub['_id']}"):
                        comment_text = st.text_input("Add Comment")
                        if st.form_submit_button("Add Comment"):
                            comment_response = api_call('POST', f"/submissions/{sub['_id']}/comment", {"comment": comment_text})
                            if comment_response.status_code == 200:
                                st.success("Comment added!")
                                st.rerun()
                            else:
                                st.error("Failed to add comment")

                    # Update status
                    status_options = ["approved", "revision"]
                    new_status = st.selectbox("Update Status", status_options, key=f"status_{sub['_id']}")
                    if st.button("Update Status", key=f"update_{sub['_id']}"):
                        status_response = api_call('PUT', f"/submissions/{sub['_id']}/status", {"status": new_status})
                        if status_response.status_code == 200:
                            st.success("Status updated!")
                            st.rerun()
                        else:
                            st.error("Failed to update status")
    else:
        st.error("Failed to load submissions")
