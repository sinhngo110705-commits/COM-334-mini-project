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
    const formData = await request.formData();
    const file = formData.get('file');
    const token = formData.get('token');

    if (!file) {
      return json({ ok: false, message: 'Không tìm thấy file.' }, 400);
    }

    // Verify admin token
    if (token) {
      const session = await env.DB.prepare(
        'SELECT s.user_id, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime("now")'
      ).bind(token).first();

      if (!session || session.role !== 'admin') {
        return json({ ok: false, message: 'Không có quyền upload.' }, 403);
      }
    } else {
      return json({ ok: false, message: 'Cần đăng nhập admin.' }, 401);
    }

    // Generate unique filename
    const ext = file.name.split('.').pop().toLowerCase();
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

    // Return the public URL (assuming R2 custom domain or public bucket)
    const imageUrl = `/cdn/${key}`;

    return json({ ok: true, imageUrl, key });
  } catch (err) {
    return json({ ok: false, message: err.message }, 500);
  }
}
