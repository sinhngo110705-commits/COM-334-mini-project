/* ===================================================
   API: /api/cart - Sync Cart with D1 Database
   =================================================== */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// GET /api/cart?token=xxx - Get cart for user
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) return json({ ok: false, message: 'Vui lòng đăng nhập.' }, 401);

  try {
    const session = await env.DB.prepare(
      'SELECT u.cart_items FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime("now")'
    ).bind(token).first();

    if (!session) return json({ ok: false, message: 'Phiên hết hạn.' }, 401);

    const cart = session.cart_items ? JSON.parse(session.cart_items) : [];
    return json({ ok: true, cart });
  } catch (err) {
    return json({ ok: false, message: err.message }, 500);
  }
}

// POST /api/cart - Save cart to user account
export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    const body = await request.json();
    const { token, cart } = body;

    if (!token) return json({ ok: false, message: 'Vui lòng đăng nhập.' }, 401);
    if (!Array.isArray(cart)) return json({ ok: false, message: 'Dữ liệu không hợp lệ.' }, 400);

    const session = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
    ).bind(token).first();

    if (!session) return json({ ok: false, message: 'Phiên hết hạn.' }, 401);

    await env.DB.prepare(
      'UPDATE users SET cart_items = ? WHERE id = ?'
    ).bind(JSON.stringify(cart), session.user_id).run();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, message: err.message }, 500);
  }
}
