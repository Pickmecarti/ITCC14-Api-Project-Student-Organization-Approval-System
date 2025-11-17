// reset.js - Clear all stored data and reset state
localStorage.removeItem('currentUser');
localStorage.removeItem('users');
localStorage.removeItem('submissions');
console.log('All data cleared. Starting fresh...');