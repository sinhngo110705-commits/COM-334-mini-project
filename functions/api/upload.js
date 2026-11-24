import { canBeAdmin } from '../admin-access.js';

/* ===================================================
   API: /api/upload - Upload images to R2
   =================================================== */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
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
      'SELECT s.user_id, u.role, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND julianday(s.expires_at) > julianday("now")'
    ).bind(token).first();

    if (!session || session.role !== 'admin' || !canBeAdmin(session)) {
      return json({ ok: false, message: 'Cần quyền quản trị để tải ảnh lên.' }, 403);
    }

    // Validate file presence
    if (!file || typeof file === 'string' || !file.name) {
      return json({ ok: false, message: 'Không tìm thấy file.' }, 400);
    }

    // Generate unique filename
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const formats = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif' };
    if (!Object.hasOwn(formats, ext)) {
      return json({ ok: false, message: 'Chỉ hỗ trợ ảnh JPEG, PNG, WebP, GIF và AVIF.' }, 400);
    }
    if (!file.size || file.size > 10 * 1024 * 1024) {
      return json({ ok: false, message: 'Ảnh phải có dung lượng từ 1 byte đến 10 MB.' }, 400);
    }

    const fileName = `${crypto.randomUUID()}.${ext}`;
    const key = `products/${fileName}`;

    // Upload to R2
    await env.IMAGES.put(key, file.stream(), {
      httpMetadata: { contentType: formats[ext] }
    });

    // Return the public URL
    const imageUrl = `/cdn/${key}`;
    return json({ ok: true, imageUrl, key });
  } catch (err) {
    return json({ ok: false, message: err.message }, 500);
  }
}
