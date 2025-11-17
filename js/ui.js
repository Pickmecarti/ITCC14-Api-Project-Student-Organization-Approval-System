// js/ui.js
let currentUser = null;

export function showSuccess(message) {
  const el = document.getElementById('successMessage');
  const notif = document.getElementById('successNotification');
  if (el && notif) {
    el.textContent = message;
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 3000);
  }
}

export function showAuth() {
  console.log('Showing auth section');
  const authSection = document.getElementById('authSection');
  const appSection = document.getElementById('appSection');
  
  if (authSection) authSection.style.display = 'flex';
  if (appSection) appSection.style.display = 'none';
}

export function showApp(user) {
  console.log('Showing app for user:', user?.name);
  currentUser = user;
  
  const authSection = document.getElementById('authSection');
  const appSection = document.getElementById('appSection');
  
  if (authSection) authSection.style.display = 'none';
  if (appSection) appSection.style.display = 'block';

  // Update user info in header
  const userNameEl = document.getElementById('userName');
  const userAvatarEl = document.getElementById('userAvatar');
  
  if (userNameEl) {
    userNameEl.textContent = `${user.name} (${user.role.charAt(0).toUpperCase() + user.role.slice(1)})`;
  }
  
  if (userAvatarEl) {
    userAvatarEl.textContent = user.avatar;
    userAvatarEl.className = 'user-avatar ' + (user.role === 'student' ? 'student-avatar' : 'admin-avatar');
  }

  // Show correct navigation
  const studentNav = document.getElementById('studentNav');
  const adminNav = document.getElementById('adminNav');
  
  if (user.role === 'student') {
    if (studentNav) studentNav.style.display = 'flex';
    if (adminNav) adminNav.style.display = 'none';
    
    // Activate student dashboard by default
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    const studentDashboardTab = document.querySelector('[data-tab="student-dashboard"]');
    if (studentDashboardTab) studentDashboardTab.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const studentDashboard = document.getElementById('student-dashboard');
    if (studentDashboard) studentDashboard.classList.add('active');
  } else {
    if (studentNav) studentNav.style.display = 'none';
    if (adminNav) adminNav.style.display = 'flex';
    
    // Activate admin dashboard by default
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    const adminDashboardTab = document.querySelector('[data-tab="admin-dashboard"]');
    if (adminDashboardTab) adminDashboardTab.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const adminDashboard = document.getElementById('admin-dashboard');
    if (adminDashboard) adminDashboard.classList.add('active');
  }
}

export function showModal(submission) {
  if (!submission) return;

  // Update modal content
  const elements = {
    'viewTitle': submission.title,
    'viewOrganization': submission.organization,
    'viewSubmittedBy': submission.submittedBy,
    'viewObjectives': submission.objectives,
    'viewBudget': `₱${submission.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    'viewVenue': submission.venue,
    'viewDescription': submission.description || 'No description provided',
    'viewDateOfActivity': new Date(submission.dateOfActivity).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    'viewDateSubmitted': new Date(submission.dateSubmitted).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });

  const statusEl = document.getElementById('viewStatus');
  if (statusEl) {
    statusEl.innerHTML = `<span class="status-badge status-${submission.status.toLowerCase().replace(' ', '-')}">${submission.status}</span>`;
  }

  const commentsContainer = document.getElementById('commentsContainer');
  if (commentsContainer) {
    if (submission.comments.length === 0) {
      commentsContainer.innerHTML = '<div style="text-align:center;padding:2rem;color:#64748b;">No comments yet</div>';
    } else {
      commentsContainer.innerHTML = submission.comments.map(c => {
        const date = new Date(c.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        return `
          <div class="comment">
            <div class="comment-header">
              <span class="comment-author">${c.author}</span>
              <span class="comment-date">${date}</span>
            </div>
            <p>${c.text}</p>
          </div>
        `;
      }).join('');
    }
  }

  // Show/hide admin features based on user role
  const adminFeatures = ['adminCommentForm', 'approveBtn', 'requestRevisionsBtn', 'disapproveBtn', 'addCommentBtn'];
  const isAdmin = currentUser && currentUser.role === 'admin';
  
  adminFeatures.forEach(featureId => {
    const element = document.getElementById(featureId);
    if (element) {
      element.style.display = isAdmin ? 'block' : 'none';
    }
  });

  const modal = document.getElementById('viewSubmissionModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Close modal when clicking X
const closeModalBtn = document.getElementById('closeViewModal');
if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => {
    const modal = document.getElementById('viewSubmissionModal');
    if (modal) modal.style.display = 'none';
  });
}

// Close modal when clicking outside
const modal = document.getElementById('viewSubmissionModal');
if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}