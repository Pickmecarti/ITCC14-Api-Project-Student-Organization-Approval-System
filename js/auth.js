// js/auth.js
import { users, saveUsers } from './data.js';
import { showApp, showAuth, showSuccess } from './ui.js';

let currentRole = 'student';
let isLoginMode = true;
let currentUser = null;

function initAuth() {
  console.log('Initializing auth system...');
  
  // Check if user is already logged in
  const saved = localStorage.getItem('currentUser');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      console.log('Found saved user:', currentUser.name);
      showApp(currentUser);
      // Load the correct module based on user role
      if (currentUser.role === 'student') {
        import('./student.js').then(m => {
          console.log('Loading student module...');
          m.initStudent(currentUser);
        });
      } else {
        import('./admin.js').then(m => {
          console.log('Loading admin module...');
          m.initAdmin(currentUser);
        });
      }
      return;
    } catch (e) {
      console.error('Error loading saved user:', e);
      localStorage.removeItem('currentUser');
      showAuthScreen();
    }
  } else {
    showAuthScreen();
  }
}

function showAuthScreen() {
  console.log('Showing authentication screen');
  showAuth();
  setupRoleTabs();
  setupToggle();
  setupAuthEventListeners();
}

function setupAuthEventListeners() {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  } else {
    console.error('Login form not found!');
  }

  // Register form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  } else {
    console.error('Logout button not found!');
  }
}

function setupRoleTabs() {
  document.querySelectorAll('.role-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentRole = tab.dataset.role;
      document.querySelectorAll('.student-field').forEach(f => {
        f.style.display = currentRole === 'student' ? 'block' : 'none';
      });
    });
  });
}

function setupToggle() {
  const toggleBtn = document.getElementById('authToggleBtn');
  if (!toggleBtn) {
    console.error('Auth toggle button not found!');
    return;
  }

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    document.getElementById('loginForm').style.display = isLoginMode ? 'block' : 'none';
    document.getElementById('registerForm').style.display = isLoginMode ? 'none' : 'block';
    document.getElementById('authToggleText').innerHTML = isLoginMode
      ? 'Don\'t have an account? <button class="auth-toggle" id="authToggleBtn">Sign up</button>'
      : 'Already have an account? <button class="auth-toggle" id="authToggleBtn">Sign in</button>';
    setupToggle(); // rebind the event listener
  });
}

function handleLogin(e) {
  e.preventDefault();
  console.log('Login attempt...');
  
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPassword').value;
  
  if (!email || !pass) {
    alert('Please enter both email and password');
    return;
  }

  const user = users.find(u => u.email === email && u.password === pass);
  if (user) {
    console.log('Login successful for:', user.name);
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    showApp(user);
    showSuccess('Login successful!');
    
    // Dynamically load student or admin views
    if (user.role === 'student') {
      import('./student.js').then(m => m.initStudent(user));
    } else {
      import('./admin.js').then(m => m.initAdmin(user));
    }
  } else {
    console.log('Login failed - invalid credentials');
    alert('Invalid email or password');
  }
}

function handleRegister(e) {
  e.preventDefault();
  console.log('Registration attempt...');
  
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const pass = document.getElementById('registerPassword').value;
  const confirm = document.getElementById('registerConfirmPassword').value;
  const studentId = document.getElementById('registerStudentId').value;
  const org = document.getElementById('registerOrganization').value;

  if (!name || !email || !pass) {
    alert('Please fill in all required fields');
    return;
  }

  if (pass !== confirm) {
    alert('Passwords do not match');
    return;
  }

  if (users.some(u => u.email === email)) {
    alert('Email already exists');
    return;
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password: pass,
    role: currentRole,
    avatar: name.split(' ').map(n => n[0]).join('').toUpperCase()
  };
  
  if (currentRole === 'student') {
    if (!studentId || !org) {
      alert('Please fill in student ID and organization');
      return;
    }
    newUser.studentId = studentId;
    newUser.organization = org;
  }
  
  users.push(newUser);
  saveUsers();
  currentUser = newUser;
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  showApp(newUser);
  showSuccess('Account created successfully!');
  
  if (newUser.role === 'student') {
    import('./student.js').then(m => m.initStudent(newUser));
  } else {
    import('./admin.js').then(m => m.initAdmin(newUser));
  }
}

function handleLogout() {
  console.log('Logging out...');
  currentUser = null;
  localStorage.removeItem('currentUser');
  showAuth();
  
  // Reset forms
  document.getElementById('loginForm')?.reset();
  document.getElementById('registerForm')?.reset();
  
  // Reset to login mode
  isLoginMode = true;
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('authToggleText').innerHTML = 
    'Don\'t have an account? <button class="auth-toggle" id="authToggleBtn">Sign up</button>';
  
  showSuccess('Logged out successfully!');
}

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}