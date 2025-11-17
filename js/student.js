// js/student.js
import { submissions, saveSubmissions } from './data.js';
import { showSuccess } from './ui.js';

let currentUser = null;

export function initStudent(user) {
  currentUser = user;
  renderStudentDashboard();
  setupStudentTabs();
  document.getElementById('submissionForm')?.addEventListener('submit', handleNewSubmission);
  document.getElementById('cancelSubmission')?.addEventListener('click', () => document.getElementById('submissionForm').reset());
  renderStudentSubmissions();
  setupStudentButtons();
}

function setupStudentTabs() {
  document.querySelectorAll('[data-tab]').forEach(tab => {
    if (!tab.closest('#adminNav')) {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    }
  });
}

function setupStudentButtons() {
  // Export button
  document.getElementById('exportMySubmissionsBtn')?.addEventListener('click', handleExportMySubmissions);
  
  // Status filter
  document.getElementById('studentStatusFilter')?.addEventListener('change', filterStudentSubmissions);
}

function handleNewSubmission(e) {
  e.preventDefault();
  const form = e.target;
  const newSub = {
    id: 'sub-' + Date.now(),
    title: form.title.value,
    organization: form.organization.value,
    submittedBy: currentUser.name,
    objectives: form.objectives.value,
    description: form.description.value,
    budget: parseFloat(form.budget.value),
    venue: form.venue.value,
    dateOfActivity: form.dateOfActivity.value,
    dateSubmitted: new Date().toISOString(),
    status: 'Pending',
    comments: []
  };
  submissions.unshift(newSub);
  saveSubmissions();
  form.reset();
  renderStudentSubmissions();
  // Switch to submissions tab
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tab="student-submissions"]').classList.add('active');
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('student-submissions').classList.add('active');
  showSuccess('Proposal submitted!');
}

export function renderStudentSubmissions() {
  const tbody = document.getElementById('studentSubmissionsTableBody');
  if (!tbody) return;
  const mySubs = submissions.filter(s => s.submittedBy === currentUser.name);
  tbody.innerHTML = mySubs.length ? '' : `<tr><td colspan="5" style="text-align:center;padding:2rem;color:#64748b;">No submissions</td></tr>`;
  mySubs.forEach(sub => {
    const row = document.createElement('tr');
    const date = new Date(sub.dateSubmitted).toLocaleDateString();
    const statusClass = `status-badge status-${sub.status.toLowerCase().replace(' ', '-')}`;
    row.innerHTML = `
      <td>${sub.title}</td>
      <td>${sub.organization}</td>
      <td>${date}</td>
      <td><span class="${statusClass}">${sub.status}</span></td>
      <td><button class="action-btn view-btn" data-id="${sub.id}">View</button></td>
    `;
    tbody.appendChild(row);
  });
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => import('./ui.js').then(u => u.showModal(submissions.find(s => s.id === btn.dataset.id))));
  });
}

function filterStudentSubmissions() {
  const statusFilter = document.getElementById('studentStatusFilter')?.value || '';
  const mySubs = submissions.filter(s => s.submittedBy === currentUser.name);
  
  let filtered = mySubs;
  if (statusFilter) {
    filtered = mySubs.filter(s => s.status === statusFilter);
  }
  
  const tbody = document.getElementById('studentSubmissionsTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = filtered.length ? '' : `<tr><td colspan="5" style="text-align:center;padding:2rem;color:#64748b;">No submissions</td></tr>`;
  
  filtered.forEach(sub => {
    const row = document.createElement('tr');
    const date = new Date(sub.dateSubmitted).toLocaleDateString();
    const statusClass = `status-badge status-${sub.status.toLowerCase().replace(' ', '-')}`;
    row.innerHTML = `
      <td>${sub.title}</td>
      <td>${sub.organization}</td>
      <td>${date}</td>
      <td><span class="${statusClass}">${sub.status}</span></td>
      <td><button class="action-btn view-btn" data-id="${sub.id}">View</button></td>
    `;
    tbody.appendChild(row);
  });
  
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => import('./ui.js').then(u => u.showModal(submissions.find(s => s.id === btn.dataset.id))));
  });
}

function handleExportMySubmissions() {
  const mySubs = submissions.filter(s => s.submittedBy === currentUser.name);
  const statusFilter = document.getElementById('studentStatusFilter')?.value || '';
  
  let filtered = mySubs;
  if (statusFilter) {
    filtered = mySubs.filter(s => s.status === statusFilter);
  }
  
  const csv = convertToCSV(filtered);
  downloadCSV(csv, 'my_project_submissions.csv');
  showSuccess('Your submissions exported successfully!');
}

function renderStudentDashboard() {
  // Stats
  const mySubs = submissions.filter(s => s.submittedBy === currentUser.name);
  const pending = mySubs.filter(s => s.status === 'Pending').length;
  const approved = mySubs.filter(s => s.status === 'Approved').length;

  document.getElementById('studentStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-info"><h3>${mySubs.length}</h3><p>My Submissions</p></div>
      <div class="stat-icon icon-primary">📄</div>
    </div>
    <div class="stat-card">
      <div class="stat-info"><h3>${pending}</h3><p>Pending Review</p></div>
      <div class="stat-icon icon-warning">⏱️</div>
    </div>
    <div class="stat-card">
      <div class="stat-info"><h3>${approved}</h3><p>Approved</p></div>
      <div class="stat-icon icon-success">✅</div>
    </div>
  `;
}

// Utility functions
function convertToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = ['Title', 'Organization', 'Status', 'Budget', 'Venue', 'Date of Activity', 'Date Submitted'];
  const csvRows = [headers.join(',')];
  
  data.forEach(item => {
    const row = [
      `"${item.title}"`,
      `"${item.organization}"`,
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