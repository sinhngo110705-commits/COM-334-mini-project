/* ===================================================
   SỮAHẠT DANA - Account System (localStorage mock)
   Ready to migrate to Firebase / Supabase / Custom API
   =================================================== */

const Auth = (() => {
  const USERS_KEY   = 'dana_users';
  const SESSION_KEY = 'dana_session';

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch { return []; }
  }

  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
  }

  function setSession(user) {
    const safe = { id: user.id, name: user.name, email: user.email, phone: user.phone || '', createdAt: user.createdAt };
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
  }

  function clearSession() { localStorage.removeItem(SESSION_KEY); }

  function register(name, email, password, phone = '') {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return { ok: false, message: 'Email này đã được sử dụng.' };
    }
    const user = {
      id: 'user_' + Date.now(),
      name, email,
      password: btoa(password), // NOTE: real app → use bcrypt via API
      phone,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    saveUsers(users);
    setSession(user);
    return { ok: true, user };
  }

  function login(email, password) {
    const users = getUsers();
    const user  = users.find(u => u.email === email && u.password === btoa(password));
    if (!user) return { ok: false, message: 'Email hoặc mật khẩu không đúng.' };
    setSession(user);
    return { ok: true, user };
  }

  function logout() {
    clearSession();
    window.location.href = 'account.html';
  }

  function updateProfile(updates) {
    const session = getCurrentUser();
    if (!session) return { ok: false, message: 'Chưa đăng nhập.' };
    const users = getUsers();
    const idx   = users.findIndex(u => u.id === session.id);
    if (idx === -1) return { ok: false, message: 'Tài khoản không tồn tại.' };
    Object.assign(users[idx], updates);
    saveUsers(users);
    setSession(users[idx]);
    return { ok: true };
  }

  function isLoggedIn() { return !!getCurrentUser(); }

  return { register, login, logout, isLoggedIn, getCurrentUser, updateProfile };
})();

// =================== AUTH UI CONTROLLER ===================
document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.getCurrentUser();

  // Update nav account icon label
  const accountIcon = document.getElementById('account-nav-icon');
  if (accountIcon && user) {
    accountIcon.setAttribute('title', user.name);
    accountIcon.querySelector('svg')?.setAttribute('fill', 'var(--sage)');
  }

  // Show/hide elements based on auth state
  document.querySelectorAll('[data-auth-show]').forEach(el => {
    const show = el.dataset.authShow;
    if (show === 'logged-in'  && !user) el.classList.add('hidden');
    if (show === 'logged-out' && user)  el.classList.add('hidden');
  });

  // Set profile data in DOM
  if (user) {
    document.querySelectorAll('[data-user-name]').forEach(el  => el.textContent = user.name);
    document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = user.email);
    document.querySelectorAll('[data-user-phone]').forEach(el => el.textContent = user.phone || '—');
  }

  // ========== LOGIN FORM ==========
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email    = loginForm.querySelector('#login-email').value.trim();
      const password = loginForm.querySelector('#login-password').value;
      const result   = Auth.login(email, password);
      if (result.ok) {
        window.showToast?.(`Chào mừng trở lại! 👋`, '🌿');
        setTimeout(() => window.location.reload(), 800);
      } else {
        showFormError('login-error', result.message);
      }
    });
  }

  // ========== REGISTER FORM ==========
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name     = registerForm.querySelector('#reg-name').value.trim();
      const email    = registerForm.querySelector('#reg-email').value.trim();
      const phone    = registerForm.querySelector('#reg-phone').value.trim();
      const password = registerForm.querySelector('#reg-password').value;
      const confirm  = registerForm.querySelector('#reg-confirm').value;

      if (password !== confirm) {
        showFormError('reg-error', 'Mật khẩu xác nhận không khớp.');
        return;
      }
      if (password.length < 6) {
        showFormError('reg-error', 'Mật khẩu phải có ít nhất 6 ký tự.');
        return;
      }

      const result = Auth.register(name, email, password, phone);
      if (result.ok) {
        window.showToast?.('Đăng ký thành công! Chào mừng bạn đến với Dana 🌿', '✅');
        setTimeout(() => window.location.reload(), 900);
      } else {
        showFormError('reg-error', result.message);
      }
    });
  }

  // ========== LOGOUT ==========
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', () => Auth.logout());
  });

  // ========== PROFILE FORM ==========
  const profileForm = document.getElementById('profile-form');
  if (profileForm && user) {
    profileForm.querySelector('#pf-name')  && (profileForm.querySelector('#pf-name').value  = user.name  || '');
    profileForm.querySelector('#pf-email') && (profileForm.querySelector('#pf-email').value = user.email || '');
    profileForm.querySelector('#pf-phone') && (profileForm.querySelector('#pf-phone').value = user.phone || '');

    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = Auth.updateProfile({
        name:  profileForm.querySelector('#pf-name')?.value.trim(),
        phone: profileForm.querySelector('#pf-phone')?.value.trim()
      });
      if (result.ok) window.showToast?.('Cập nhật thông tin thành công!', '✅');
    });
  }

  // ========== REDIRECT IF NOT LOGGED IN (for protected pages) ==========
  const isProtectedPage = document.body.classList.contains('protected-page');
  if (isProtectedPage && !Auth.isLoggedIn()) {
    window.location.href = 'account.html?redirect=' + encodeURIComponent(window.location.pathname);
  }
});

function showFormError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 5000); }
}
