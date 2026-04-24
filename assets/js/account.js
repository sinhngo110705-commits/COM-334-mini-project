/* ===================================================
   SỮAHẠT DANA - Account System (Cloud API Version)
   Connects to Cloudflare D1 via /api/auth
   hnguyenworks.id.vn
   =================================================== */

const Auth = (() => {
  const TOKEN_KEY = 'dana_auth_token';
  const USER_KEY  = 'dana_user';

  function getToken() { return localStorage.getItem(TOKEN_KEY); }

  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
  }

  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Also clean up legacy keys
    localStorage.removeItem('dana_session');
    localStorage.removeItem('dana_users');
  }

  async function register(name, email, password, phone = '') {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, email, password, phone })
      });
      const data = await res.json();
      if (data.ok) {
        setSession(data.token, data.user);
      }
      return data;
    } catch (err) {
      return { ok: false, message: 'Lỗi kết nối server. Vui lòng thử lại.' };
    }
  }

  async function login(email, password) {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });
      const data = await res.json();
      if (data.ok) {
        setSession(data.token, data.user);
      }
      return data;
    } catch (err) {
      return { ok: false, message: 'Lỗi kết nối server. Vui lòng thử lại.' };
    }
  }

  async function logout() {
    const token = getToken();
    if (token) {
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout', token })
      }).catch(() => {});
    }
    clearSession();
    window.location.href = 'account.html';
  }

  async function verifySession() {
    const token = getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', token })
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return data.user;
      } else {
        clearSession();
        return null;
      }
    } catch {
      // Offline - use cached user
      return getCurrentUser();
    }
  }

  function isLoggedIn() { return !!getToken() && !!getCurrentUser(); }

  function updateProfile(updates) {
    // Update local cache (server-side update can be added later)
    const user = getCurrentUser();
    if (!user) return { ok: false, message: 'Chưa đăng nhập.' };
    Object.assign(user, updates);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { ok: true };
  }

  return { register, login, logout, verifySession, isLoggedIn, getCurrentUser, getToken, updateProfile };
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
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email    = loginForm.querySelector('#login-email').value.trim();
      const password = loginForm.querySelector('#login-password').value;
      const result   = await Auth.login(email, password);
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
    registerForm.addEventListener('submit', async (e) => {
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

      const result = await Auth.register(name, email, password, phone);
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

  // ========== LOAD ORDERS ==========
  if (user && document.getElementById('ptab-tab-orders')) {
    loadUserOrders();
  }
});

async function loadUserOrders() {
  const container = document.getElementById('ptab-tab-orders');
  try {
    const res = await fetch(`/api/orders?token=${Auth.getToken()}`);
    const data = await res.json();
    if (data.ok && data.orders && data.orders.length > 0) {
      let html = `<h3 style="margin-bottom:28px;font-size:1.5rem">Đơn hàng của tôi</h3><div style="display:grid;gap:16px">`;
      data.orders.forEach(o => {
        const d = new Date(o.created_at);
        const dateStr = d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
        
        let statusBadge = '';
        let canCancel = false;
        switch(o.status) {
          case 'pending': statusBadge = '<span style="background:var(--cream);color:var(--sage-dark);padding:4px 10px;border-radius:12px;font-size:0.8rem;font-weight:600">Chờ xử lý</span>'; canCancel = true; break;
          case 'confirmed': statusBadge = '<span style="background:rgba(56,189,248,0.15);color:#0284c7;padding:4px 10px;border-radius:12px;font-size:0.8rem;font-weight:600">Đã xác nhận</span>'; break;
          case 'delivered': statusBadge = '<span style="background:rgba(34,197,94,0.15);color:#16a34a;padding:4px 10px;border-radius:12px;font-size:0.8rem;font-weight:600">Đã giao</span>'; break;
          case 'cancelled': statusBadge = '<span style="background:rgba(248,113,113,0.15);color:#dc2626;padding:4px 10px;border-radius:12px;font-size:0.8rem;font-weight:600">Đã hủy</span>'; break;
        }

        const itemsStr = o.items.map(i => `${i.name} x${i.qty}`).join(', ');

        html += `
          <div style="border:1px solid var(--gray-light);border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--cream);padding-bottom:12px">
              <div>
                <strong style="color:var(--sage-dark);font-size:1.1rem">#${o.id}</strong>
                <div style="color:var(--gray);font-size:0.85rem;margin-top:4px">${dateStr}</div>
              </div>
              <div style="text-align:right">
                ${statusBadge}
                <div style="margin-top:8px;font-weight:700;font-size:1.1rem">${o.total.toLocaleString('vi-VN')}đ</div>
              </div>
            </div>
            <div style="color:var(--gray);font-size:0.9rem">
              <strong>Sản phẩm:</strong> ${itemsStr}
            </div>
            ${canCancel ? `<div style="text-align:right;margin-top:8px"><button onclick="cancelOrder('${o.id}')" style="background:rgba(248,113,113,0.1);color:#dc2626;border:1px solid rgba(248,113,113,0.2);padding:6px 16px;border-radius:8px;font-weight:600;cursor:pointer;transition:all 0.2s">🚨 Hủy đơn hàng</button></div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
      container.innerHTML = html;
    }
  } catch (err) {
    console.error(err);
  }
}

window.cancelOrder = async function(orderId) {
  if (!confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId} không?`)) return;
  try {
    const res = await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: Auth.getToken(), orderId, action: 'cancel' })
    });
    const data = await res.json();
    if (data.ok) {
      window.showToast?.('Đã hủy đơn hàng thành công', '✅');
      loadUserOrders(); // Reload the list
    } else {
      window.showToast?.(data.message || 'Lỗi khi hủy đơn hàng', '❌');
    }
  } catch (err) {
    window.showToast?.('Lỗi kết nối', '❌');
  }
};

function showFormError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 5000); }
}
