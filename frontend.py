import streamlit as st
import requests
import json
from datetime import datetime

# Backend URL
BACKEND_URL = "http://localhost:8888"

st.title("SOPAS")

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
    elif method == 'DELETE':
        response = requests.delete(url, headers=headers)
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
        project_head = st.text_input("Project Head")
        budget = st.number_input("Budget", min_value=0, step=1)
        venue = st.text_input("Venue")
        organization_name = st.text_input("Name of the Organization")
        event_date = st.date_input("Event Date")
        event_time = st.time_input("Event Time")
        if st.button("Submit"):
            response = api_call('POST', '/submissions', {"title": title, "content": content, "project_head": project_head, "budget": budget, "venue": venue, "organization_name": organization_name, "event_date": str(event_date), "event_time": str(event_time)})
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
                st.write(f"Submitted by: {sub['student_id']}")
                st.write(f"Content: {sub['content']}")
                st.write(f"Project Head: {sub.get('project_head', 'N/A')}")
                st.write(f"Budget: {sub.get('budget', 'N/A')}")
                st.write(f"Venue: {sub.get('venue', 'N/A')}")
                st.write(f"Organization Name: {sub.get('organization_name', 'N/A')}")
                st.write(f"Event Date & Time: {sub.get('event_datetime', 'N/A')}")
                st.write(f"Status: {sub['status']}")
                if sub['comments']:
                    st.write("Comments:")
                    for comment in sub['comments']:
                        st.write(f"- {comment['comment']} (by {comment['admin_id']})")

                # Edit (students, all status)
                if st.session_state.role == "student" and sub['student_id'] == st.session_state.username:
                    with st.form(key=f"edit_{sub['_id']}"):
                        new_title = st.text_input("New Title", value=sub['title'])
                        new_content = st.text_area("New Content", value=sub['content'])
                        new_project_head = st.text_input("New Project Head", value=sub.get('project_head', ''))
                        new_budget = st.number_input("New Budget", min_value=0, step=1, value=int(sub.get('budget', 0)))
                        new_venue = st.text_input("New Venue", value=sub.get('venue', ''))
                        new_organization_name = st.text_input("New Name of the Organization", value=sub.get('organization_name', ''))
                        
                        # Parse existing datetime
                        existing_datetime = sub.get('event_datetime', '')

                        if existing_datetime:
                            
                            try:
                                date_part, time_part = existing_datetime.split(' ')
                                new_event_date = st.date_input("New Event Date", value=date_part)
                                new_event_time = st.time_input("New Event Time", value=time_part)
                            except:
                                new_event_date = st.date_input("New Event Date")
                                new_event_time = st.time_input("New Event Time")
                        else:
                            new_event_date = st.date_input("New Event Date")
                            new_event_time = st.time_input("New Event Time")


                        if st.form_submit_button("Update"):
                            edit_response = api_call('PUT', f"/submissions/{sub['_id']}", {"title": new_title, "content": new_content, "project_head": new_project_head, "budget": new_budget, "venue": new_venue, "organization_name": new_organization_name, "event_date": str(new_event_date), "event_time": str(new_event_time)})
                            if edit_response.status_code == 200:
                                st.success("Updated!")
                                st.rerun()
                            else:
                                st.error("Update failed")

                # Delete (students only)
                if st.session_state.role == "student" and sub['student_id'] == st.session_state.username:
                    if st.button("Delete Submission", key=f"delete_{sub['_id']}"):
                        delete_response = api_call('DELETE', f"/submissions/{sub['_id']}")
                        if delete_response.status_code == 200:
                            st.success("Deleted!")
                            st.rerun()
                        else:
                            st.error("Delete failed")

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