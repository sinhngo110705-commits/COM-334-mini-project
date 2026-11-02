/* ===================================================
   API: /api/upload - Upload images to R2
   =================================================== */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Helper: Check authorized admin email
function isAuthorizedAdminEmail(email) {
  if (!email) return false;
  const e = email.toLowerCase().trim();
  return e.includes('sinhngo110705') || e.includes('vuhoangnguyen3009');
}

// POST /api/upload - Upload image file to R2
export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    let token = null;

    // 1. Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      token = authHeader.replace(/^Bearer\s+/i, '').trim();
    }

    // 2. Query param
    if (!token) {
      try {
        const url = new URL(request.url);
        token = url.searchParams.get('token');
      } catch (e) {
        // ignore url parsing error
      }
    }

    let file = null;
    const contentType = request.headers.get('content-type') || '';

    // 3. Body parsing based on Content-Type
    if (contentType.includes('application/json')) {
      try {
        const body = await request.json();
        if (!token && body && body.token) {
          token = body.token;
        }
      } catch (e) {
        // invalid JSON body
      }
    } else if (contentType.includes('multipart/form-data') || contentType.includes('form')) {
      try {
        const formData = await request.formData();
        if (!token && formData.get('token')) {
          token = formData.get('token');
        }
        file = formData.get('file');
      } catch (e) {
        // invalid formData
      }
    }

    // Verify token presence
    if (!token) {
      return json({ ok: false, message: 'Cần đăng nhập admin.' }, 401);
    }

    // Verify admin token strictly
    const session = await env.DB.prepare(
      'SELECT s.user_id, u.role, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime("now")'
    ).bind(token).first();

    if (!session || session.role !== 'admin' || !isAuthorizedAdminEmail(session.email)) {
      return json({ ok: false, message: 'Chỉ tài khoản Admin được cấp quyền (sinhngo110705, vuhoangnguyen3009) mới có quyền upload.' }, 403);
    }

    // Validate file presence
    if (!file || typeof file === 'string' || !file.name) {
      return json({ ok: false, message: 'Không tìm thấy file.' }, 400);
    }

    // Generate unique filename
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
    if (!allowed.includes(ext)) {
      return json({ ok: false, message: 'Chỉ hỗ trợ file ảnh: ' + allowed.join(', ') }, 400);
    }

    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 8)}.${ext}`;
    const key = `products/${fileName}`;

    // Upload to R2
    await env.IMAGES.put(key, file.stream(), {
      httpMetadata: { contentType: file.type }
    });

    // Return the public URL
    const imageUrl = `/cdn/${key}`;
    return json({ ok: true, imageUrl, key });
  } catch (err) {
    return json({ ok: false, message: err.message }, 500);
  }
}
