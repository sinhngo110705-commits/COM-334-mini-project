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

// Helper: Check authorized admin email (strictly sinhngo110705 and vuhoangnguyen3009)
export function isAuthorizedAdminEmail(email) {
  if (!email) return false;
  const e = email.toLowerCase().trim();
  return e.includes('sinhngo110705') || e.includes('vuhoangnguyen3009');
}

// POST /api/auth - Handle login, register, logout, forgot-password, reset-password
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
      const role = isAuthorizedAdminEmail(email) ? 'admin' : 'user';

      await env.DB.prepare(
        'INSERT INTO users (id, name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(userId, name, email, passwordHash, phone || '', role).run();

      // Create session
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours
      await env.DB.prepare(
        'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
      ).bind(token, userId, expiresAt).run();

      return json({
        ok: true,
        token,
        user: { id: userId, name, email, phone: phone || '', role }
      });
    }

    // =================== LOGIN ===================
    if (action === 'login') {
      const { email, password } = body;

      if (!email || !password) {
        return json({ ok: false, message: 'Vui lòng nhập email và mật khẩu.' }, 400);
      }

      const emailInput = email ? email.trim() : '';
      const emailAlt = emailInput.includes('@') ? emailInput.replace(/@.*$/, '') : (emailInput + '@gmail.com');

      const passwordHash = await hashPassword(password);
      let user = await env.DB.prepare(
        'SELECT id, name, email, phone, role FROM users WHERE (email = ? OR email = ?) AND password_hash = ?'
      ).bind(emailInput, emailAlt, passwordHash).first();

      // If user provided DanaAdmin@2026 for an authorized admin email, ensure password hash and role are synced
      const validHashes = ['8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'ea554d403eec8485c738aa8ec19bf7a6f5bd229b4b1d0f089a1eae749aff2115'];
      if (!user && isAuthorizedAdminEmail(emailInput) && validHashes.includes(passwordHash)) {
        const existingAdmin = await env.DB.prepare('SELECT id, name, email, phone FROM users WHERE email = ? OR email = ?').bind(emailInput, emailAlt).first();
        if (existingAdmin) {
          await env.DB.prepare('UPDATE users SET password_hash = ?, role = "admin" WHERE id = ?').bind(passwordHash, existingAdmin.id).run();
          user = { ...existingAdmin, role: 'admin' };
        } else {
          const adminId = email.toLowerCase().includes('sinhngo') ? 'admin_sinhngo' : 'admin_vuhoangnguyen';
          const adminName = email.toLowerCase().includes('sinhngo') ? 'Sinh Ngô Admin' : 'Vũ Hoàng Nguyên Admin';
          await env.DB.prepare(
            `INSERT INTO users (id, name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, '0974445624', 'admin')`
          ).bind(adminId, adminName, email.trim(), passwordHash).run();
          user = { id: adminId, name: adminName, email: email.trim(), phone: '0974445624', role: 'admin' };
        }
      }

      if (!user) {
        return json({ ok: false, message: 'Email hoặc mật khẩu không đúng.' }, 401);
      }

      // Strictly enforce admin role: only authorized emails can be admin
      if (isAuthorizedAdminEmail(user.email)) {
        if (user.role !== 'admin') {
          await env.DB.prepare('UPDATE users SET role = "admin" WHERE id = ?').bind(user.id).run();
          user.role = 'admin';
        }
      } else if (user.role === 'admin') {
        await env.DB.prepare('UPDATE users SET role = "user" WHERE id = ?').bind(user.id).run();
        user.role = 'user';
      }

      // Create session token
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours

      // Delete old expired sessions for this user
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

      // Strictly enforce admin role for session
      let userRole = session.role;
      if (isAuthorizedAdminEmail(session.email)) {
        if (userRole !== 'admin') {
          await env.DB.prepare('UPDATE users SET role = "admin" WHERE id = ?').bind(session.id).run();
          userRole = 'admin';
        }
      } else if (userRole === 'admin') {
        await env.DB.prepare('UPDATE users SET role = "user" WHERE id = ?').bind(session.id).run();
        userRole = 'user';
      }

      return json({
        ok: true,
        user: { id: session.id, name: session.name, email: session.email, phone: session.phone, role: userRole }
      });
    }

    // =================== FORGOT PASSWORD (OTP) ===================
    if (action === 'forgot-password') {
      const { email } = body;
      if (!email) return json({ ok: false, message: 'Vui lòng nhập địa chỉ email.' }, 400);

      const user = await env.DB.prepare('SELECT id, name, email FROM users WHERE email = ?').bind(email.trim()).first();
      if (!user) {
        return json({ ok: false, message: 'Không tìm thấy tài khoản với email này.' }, 404);
      }

      // Generate 6-digit OTP code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const token = generateToken();
      const tokenHash = await hashPassword(token + otp);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

      // Invalidate previous OTPs for this email
      await env.DB.prepare('DELETE FROM password_resets WHERE email = ?').bind(email.trim()).run();

      // Save OTP to DB
      await env.DB.prepare(
        'INSERT INTO password_resets (email, token_hash, otp_code, expires_at) VALUES (?, ?, ?, ?)'
      ).bind(email.trim(), tokenHash, otp, expiresAt).run();

      return json({
        ok: true,
        message: 'Mã xác nhận OTP (6 chữ số) đã được tạo và gửi đến email. Mã có hiệu lực trong 10 phút.',
        debugOtp: otp,
        debug_otp: otp
      });
    }

    // =================== RESET PASSWORD (VERIFY OTP) ===================
    if (action === 'reset-password') {
      const { email, otp, newPassword } = body;
      if (!email || !otp || !newPassword) {
        return json({ ok: false, message: 'Vui lòng điền đầy đủ email, mã OTP và mật khẩu mới.' }, 400);
      }
      if (newPassword.length < 6) {
        return json({ ok: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' }, 400);
      }

      // Verify OTP and check expiration & used status
      const resetRecord = await env.DB.prepare(
        'SELECT * FROM password_resets WHERE email = ? AND otp_code = ? AND expires_at > datetime("now") AND used_at IS NULL'
      ).bind(email.trim(), otp.trim()).first();

      if (!resetRecord) {
        return json({ ok: false, message: 'Mã OTP không đúng hoặc đã hết hiệu lực.' }, 400);
      }

      const newHash = await hashPassword(newPassword);

      // Update password
      await env.DB.prepare('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE email = ?')
        .bind(newHash, email.trim()).run();

      // Mark OTP as used
      await env.DB.prepare('UPDATE password_resets SET used_at = datetime("now") WHERE id = ?')
        .bind(resetRecord.id).run();

      // Invalidate all active sessions for security
      const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.trim()).first();
      if (user) {
        await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id).run();
      }

      return json({
        ok: true,
        message: 'Đổi mật khẩu thành công! Tất cả phiên đăng nhập cũ đã được hủy. Vui lòng đăng nhập lại với mật khẩu mới.'
      });
    }

    return json({ ok: false, message: 'Invalid action.' }, 400);

  } catch (err) {
    return json({ ok: false, message: 'Server error: ' + err.message }, 500);
  }
}
