// js/admin.js
import { submissions, saveSubmissions } from './data.js';
import { showSuccess, showModal } from './ui.js';

let currentUser = null;
let currentViewedSubmissionId = null;
let currentFilter = 'all';

export function initAdmin(user) {
    console.log('Initializing admin dashboard for:', user.name);
    currentUser = user;
    setupAdminTabs();
    setupAdminEventListeners();
    renderAdminDashboard();
    renderAdminSubmissions();
    renderUserManagement();
}

function setupAdminTabs() {
    console.log('Setting up admin tabs');
    
    const adminTabs = document.querySelectorAll('#adminNav .nav-tab');
    adminTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Tab clicked:', tab.dataset.tab);
            
            // Remove active class from all tabs
            adminTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the selected tab content
            const tabId = tab.dataset.tab;
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
                console.log('Showing tab:', tabId);
                
                // Refresh the content if needed
                if (tabId === 'admin-dashboard') {
                    renderAdminDashboard();
                } else if (tabId === 'admin-submissions') {
                    renderAdminSubmissions();
                } else if (tabId === 'admin-users') {
                    renderUserManagement();
                }
            } else {
                console.error('Tab content not found:', tabId);
            }
        });
    });
    
    console.log('Admin tabs setup complete');
}

function setupAdminEventListeners() {
    console.log('Setting up admin event listeners');
    
    // Quick action buttons
    document.getElementById('quickReviewBtn')?.addEventListener('click', handleQuickReview);
    document.getElementById('exportReportsBtn')?.addEventListener('click', handleExportReports);
    document.getElementById('manageTemplatesBtn')?.addEventListener('click', handleManageTemplates);
    
    // Status filters
    document.querySelectorAll('.status-filter').forEach(filter => {
        filter.addEventListener('click', (e) => {
            console.log('Status filter clicked:', e.target.dataset.status);
            document.querySelectorAll('.status-filter').forEach(f => f.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.status;
            renderPendingReviews();
        });
    });
    
    // Export buttons
    document.getElementById('exportSubmissionsBtn')?.addEventListener('click', handleExportSubmissions);
    document.getElementById('printSubmissionsBtn')?.addEventListener('click', handlePrintSubmissions);
    document.getElementById('exportUsersBtn')?.addEventListener('click', handleExportUsers);
    
    // Add User button
    document.getElementById('addUserBtn')?.addEventListener('click', handleAddUser);
    
    // Modal buttons
    document.getElementById('printProposalBtn')?.addEventListener('click', handlePrintProposal);
    document.getElementById('approveBtn')?.addEventListener('click', () => handleQuickStatusUpdate('Approved'));
    document.getElementById('requestRevisionsBtn')?.addEventListener('click', () => handleQuickStatusUpdate('Revisions'));
    document.getElementById('disapproveBtn')?.addEventListener('click', () => handleQuickStatusUpdate('Disapproved'));
    
    // Status update form
    document.getElementById('updateStatusForm')?.addEventListener('submit', handleStatusUpdate);
    
    // Organization filter
    document.getElementById('adminOrganizationFilter')?.addEventListener('change', renderAdminSubmissions);
    document.getElementById('adminStatusFilter')?.addEventListener('change', renderAdminSubmissions);
    
    console.log('All admin event listeners setup complete');
}

function handleQuickReview() {
    console.log('Quick review clicked');
    const pending = submissions.filter(s => s.status === 'Pending');
    if (pending.length === 0) {
        showSuccess('No pending reviews!');
        return;
    }
    showModal(pending[0]);
    showSuccess(`Reviewing: ${pending[0].title}`);
}

function handleExportReports() {
    console.log('Export reports clicked');
    const csv = convertToCSV(submissions);
    downloadCSV(csv, 'project_submissions_report.csv');
    showSuccess('Report exported successfully!');
}

function handleManageTemplates() {
    console.log('Manage templates clicked');
    showSuccess('Template management feature coming soon!');
}

function handleExportSubmissions() {
    console.log('Export submissions clicked');
    const filter = document.getElementById('adminOrganizationFilter')?.value || '';
    const statusFilter = document.getElementById('adminStatusFilter')?.value || '';
    
    let filtered = submissions;
    if (filter) filtered = filtered.filter(s => s.organization === filter);
    if (statusFilter) filtered = filtered.filter(s => s.status === statusFilter);
    
    const csv = convertToCSV(filtered);
    downloadCSV(csv, 'project_submissions.csv');
    showSuccess('Submissions exported successfully!');
}

function handlePrintSubmissions() {
    console.log('Print submissions clicked');
    window.print();
}

function handleExportUsers() {
    console.log('Export users clicked');
    import('./data.js').then(({ users }) => {
        const csv = convertUsersToCSV(users);
        downloadCSV(csv, 'users.csv');
        showSuccess('Users exported successfully!');
    });
}

function handleAddUser() {
    console.log('Add user clicked');
    showSuccess('Add user feature coming soon!');
    
    // Simple implementation for now
    const userName = prompt('Enter new user name:');
    if (userName) {
        const userEmail = prompt('Enter user email:');
        if (userEmail) {
            showSuccess(`User "${userName}" will be added soon!`);
        }
    }
}

function handlePrintProposal() {
    console.log('Print proposal clicked');
    const submission = submissions.find(s => s.id === currentViewedSubmissionId);
    if (submission) {
        const printContent = `
            <h1>Project Proposal: ${submission.title}</h1>
            <p><strong>Organization:</strong> ${submission.organization}</p>
            <p><strong>Submitted By:</strong> ${submission.submittedBy}</p>
            <p><strong>Objectives:</strong> ${submission.objectives}</p>
            <p><strong>Budget:</strong> ₱${submission.budget.toLocaleString()}</p>
            <p><strong>Venue:</strong> ${submission.venue}</p>
            <p><strong>Date of Activity:</strong> ${new Date(submission.dateOfActivity).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${submission.status}</p>
            <p><strong>Description:</strong> ${submission.description || 'No description provided'}</p>
            <p><strong>Date Submitted:</strong> ${new Date(submission.dateSubmitted).toLocaleDateString()}</p>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Project Proposal: ${submission.title}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 2rem; 
                            line-height: 1.6;
                            color: #333;
                        }
                        h1 { 
                            color: #2563eb; 
                            border-bottom: 2px solid #2563eb; 
                            padding-bottom: 0.5rem;
                            margin-bottom: 1.5rem;
                        }
                        p { 
                            margin: 1rem 0; 
                            padding: 0.5rem 0;
                        }
                        strong { 
                            color: #374151;
                            display: inline-block;
                            width: 150px;
                        }
                        @media print {
                            body { margin: 1rem; }
                        }
                    </style>
                </head>
                <body>${printContent}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

function handleQuickStatusUpdate(status) {
    console.log('Quick status update:', status);
    if (!currentViewedSubmissionId) return;
    
    const sub = submissions.find(s => s.id === currentViewedSubmissionId);
    if (sub) {
        sub.status = status;
        saveSubmissions();
        renderAdminDashboard();
        renderAdminSubmissions();
        showSuccess(`Status updated to "${status}"!`);
        showModal(sub);
    }
}

function handleStatusUpdate(e) {
    e.preventDefault();
    console.log('Status update form submitted');
    
    if (!currentViewedSubmissionId) return;

    const status = document.getElementById('statusUpdate').value;
    const commentText = document.getElementById('commentText').value.trim();

    const sub = submissions.find(s => s.id === currentViewedSubmissionId);
    if (sub) {
        sub.status = status;
        if (commentText) {
            sub.comments.push({
                author: currentUser.name,
                text: commentText,
                timestamp: new Date().toISOString()
            });
        }
        saveSubmissions();
        renderAdminDashboard();
        renderAdminSubmissions();
        showSuccess(`Status updated to "${status}"!`);
        document.getElementById('updateStatusForm').reset();
        showModal(sub);
    }
}

function renderAdminDashboard() {
    console.log('Rendering admin dashboard');
    renderPendingReviews();
}

function renderPendingReviews() {
    const container = document.getElementById('pendingReviewsList');
    if (!container) {
        console.error('Pending reviews container not found!');
        return;
    }

    let filteredSubmissions = submissions;
    let filterDisplay = 'All Submissions';

    // Apply status filter
    switch (currentFilter) {
        case 'pending':
            filteredSubmissions = submissions.filter(s => s.status === 'Pending');
            filterDisplay = 'Pending Submissions';
            break;
        case 'approved':
            filteredSubmissions = submissions.filter(s => s.status === 'Approved');
            filterDisplay = 'Approved Submissions';
            break;
        case 'revisions':
            filteredSubmissions = submissions.filter(s => s.status === 'Revisions');
            filterDisplay = 'Revisions Required';
            break;
        case 'disapproved':
            filteredSubmissions = submissions.filter(s => s.status === 'Disapproved');
            filterDisplay = 'Disapproved Submissions';
            break;
        default:
            filteredSubmissions = submissions;
            filterDisplay = 'All Submissions';
    }

    // Update filter display
    const filterDisplayEl = document.getElementById('currentFilterDisplay');
    if (filterDisplayEl) {
        filterDisplayEl.textContent = filterDisplay;
    }

    // Render submissions
    container.innerHTML = filteredSubmissions.length ? '' : 
        '<div style="text-align:center;padding:2rem;color:#64748b;">No submissions found</div>';

    filteredSubmissions.forEach(sub => {
        const date = new Date(sub.dateSubmitted).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:1rem;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:0.5rem;background:white;';
        item.innerHTML = `
            <div style="flex:1;">
                <div style="font-weight:600;margin-bottom:0.25rem;color:#1e293b;">${sub.title}</div>
                <div style="font-size:0.9rem;color:#64748b;margin-bottom:0.25rem;">
                    ${sub.organization} • ${sub.submittedBy} • ${date}
                </div>
                <div>
                    <span class="status-badge status-${sub.status.toLowerCase().replace(' ', '-')}">${sub.status}</span>
                </div>
            </div>
            <button class="btn view-btn" data-id="${sub.id}" style="margin-left:1rem;">Review</button>
        `;
        container.appendChild(item);
    });

    // Add event listeners to view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const submissionId = e.target.dataset.id;
            const submission = submissions.find(s => s.id === submissionId);
            if (submission) {
                currentViewedSubmissionId = submissionId;
                showModal(submission);
            }
        });
    });

    console.log(`Rendered ${filteredSubmissions.length} submissions with filter: ${currentFilter}`);
}

export function renderAdminSubmissions() {
    const tbody = document.getElementById('adminSubmissionsTableBody');
    if (!tbody) {
        console.error('Admin submissions table body not found!');
        return;
    }

    const orgFilter = document.getElementById('adminOrganizationFilter')?.value || '';
    const statusFilter = document.getElementById('adminStatusFilter')?.value || '';
    
    let filtered = submissions;
    if (orgFilter) filtered = filtered.filter(s => s.organization === orgFilter);
    if (statusFilter) filtered = filtered.filter(s => s.status === statusFilter);

    tbody.innerHTML = filtered.length ? '' : 
        '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#64748b;">No submissions found</td></tr>';

    filtered.forEach(sub => {
        const date = new Date(sub.dateSubmitted).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        const statusClass = `status-badge status-${sub.status.toLowerCase().replace(' ', '-')}`;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sub.title}</td>
            <td>${sub.organization}</td>
            <td>${sub.submittedBy}</td>
            <td>${date}</td>
            <td><span class="${statusClass}">${sub.status}</span></td>
            <td><button class="btn view-btn" data-id="${sub.id}">Review</button></td>
        `;
        tbody.appendChild(row);
    });

    // Add event listeners to view buttons in table
    document.querySelectorAll('#adminSubmissionsTableBody .view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const submissionId = e.target.dataset.id;
            const submission = submissions.find(s => s.id === submissionId);
            if (submission) {
                currentViewedSubmissionId = submissionId;
                showModal(submission);
            }
        });
    });

    console.log(`Rendered ${filtered.length} submissions in table view`);
}

function renderUserManagement() {
    const tbody = document.getElementById('userManagementTable');
    if (!tbody) {
        console.error('User management table not found!');
        return;
    }

    import('./data.js').then(({ users }) => {
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                        <div class="user-avatar ${user.role === 'student' ? 'student-avatar' : 'admin-avatar'}">${user.avatar}</div>
                        <div>
                            <div style="font-weight:500;">${user.name}</div>
                            <div style="font-size:0.8rem;color:#64748b;">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${user.role === 'student' ? 'status-pending' : 'status-approved'}">
                        ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                </td>
                <td>${user.organization || '—'}</td>
                <td><span class="status-badge status-approved">Active</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" style="padding:0.25rem 0.5rem;font-size:0.8rem;">Edit</button>
                        <button class="btn btn-danger" style="padding:0.25rem 0.5rem;font-size:0.8rem;">Deactivate</button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        console.log(`Rendered ${users.length} users in management table`);
    }).catch(error => {
        console.error('Error loading users:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#64748b;">Error loading users</td></tr>';
    });
}

// Utility functions
function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = ['Title', 'Organization', 'Submitted By', 'Status', 'Budget', 'Venue', 'Date of Activity', 'Date Submitted'];
    const csvRows = [headers.join(',')];
    
    data.forEach(item => {
        const row = [
            `"${item.title}"`,
            `"${item.organization}"`,
            `"${item.submittedBy}"`,
            `"${item.status}"`,
            item.budget,
            `"${item.venue}"`,
            `"${item.dateOfActivity}"`,
            `"${new Date(item.dateSubmitted).toLocaleDateString()}"`
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

function convertUsersToCSV(users) {
    if (users.length === 0) return '';
    
    const headers = ['Name', 'Email', 'Role', 'Organization', 'Student ID'];
    const csvRows = [headers.join(',')];
    
    users.forEach(user => {
        const row = [
            `"${user.name}"`,
            `"${user.email}"`,
            `"${user.role}"`,
            `"${user.organization || ''}"`,
            `"${user.studentId || ''}"`
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('viewSubmissionModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Close modal when clicking X
document.getElementById('closeViewModal')?.addEventListener('click', () => {
    document.getElementById('viewSubmissionModal').style.display = 'none';
});

// Handle escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('viewSubmissionModal').style.display = 'none';
    }
});

console.log('Admin module loaded successfully');