/* ===================================================
   API: /api/auth - Authentication (Register, Login, Logout)
   Security: SHA-256 password hashing via Web Crypto API
   =================================================== */

// Helper: Hash password with SHA-256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: Generate secure random token
function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: JSON response
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// POST /api/auth - Handle login, register, logout
export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  const action = body.action;

  try {
    // =================== REGISTER ===================
    if (action === 'register') {
      const { name, email, password, phone } = body;

      if (!name || !email || !password) {
        return json({ ok: false, message: 'Vui lòng điền đầy đủ thông tin.' }, 400);
      }
      if (password.length < 6) {
        return json({ ok: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' }, 400);
      }

      // Check if email already exists
      const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
      if (existing) {
        return json({ ok: false, message: 'Email này đã được sử dụng.' }, 409);
      }

      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const passwordHash = await hashPassword(password);

      await env.DB.prepare(
        'INSERT INTO users (id, name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(userId, name, email, passwordHash, phone || '', 'user').run();

      // Create session
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours
      await env.DB.prepare(
        'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
      ).bind(token, userId, expiresAt).run();

      return json({
        ok: true,
        token,
        user: { id: userId, name, email, phone: phone || '', role: 'user' }
      });
    }

    // =================== LOGIN ===================
    if (action === 'login') {
      const { email, password } = body;

      if (!email || !password) {
        return json({ ok: false, message: 'Vui lòng nhập email và mật khẩu.' }, 400);
      }

      const passwordHash = await hashPassword(password);
      const user = await env.DB.prepare(
        'SELECT id, name, email, phone, role FROM users WHERE email = ? AND password_hash = ?'
      ).bind(email, passwordHash).first();

      if (!user) {
        return json({ ok: false, message: 'Email hoặc mật khẩu không đúng.' }, 401);
      }

      // Create session token
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours

      // Delete old sessions for this user (max 5 sessions)
      await env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND expires_at < datetime("now")').bind(user.id).run();

      await env.DB.prepare(
        'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
      ).bind(token, user.id, expiresAt).run();

      return json({
        ok: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
      });
    }

    // =================== LOGOUT ===================
    if (action === 'logout') {
      const token = body.token;
      if (token) {
        await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
      }
      return json({ ok: true });
    }

    // =================== VERIFY TOKEN ===================
    if (action === 'verify') {
      const token = body.token;
      if (!token) return json({ ok: false, message: 'Token not provided.' }, 401);

      const session = await env.DB.prepare(
        'SELECT s.user_id, s.expires_at, u.id, u.name, u.email, u.phone, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ?'
      ).bind(token).first();

      if (!session || new Date(session.expires_at) < new Date()) {
        if (session) await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
        return json({ ok: false, message: 'Session expired.' }, 401);
      }

      return json({
        ok: true,
        user: { id: session.id, name: session.name, email: session.email, phone: session.phone, role: session.role }
      });
    }

    return json({ ok: false, message: 'Invalid action.' }, 400);

  } catch (err) {
    return json({ ok: false, message: 'Server error: ' + err.message }, 500);
  }
}
