/* ===================================================
   API: /api/orders - Order Management
   =================================================== */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// POST /api/orders - Create a new order
export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    const body = await request.json();
    const { customerName, customerPhone, customerEmail, customerAddress, items, subtotal, shipping, total, token } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return json({ ok: false, message: 'Giỏ hàng trống.' }, 400);
    }
    if (!customerName || !customerPhone) {
      return json({ ok: false, message: 'Vui lòng nhập tên và số điện thoại.' }, 400);
    }

    // Optionally link to user account
    let userId = null;
    if (token) {
      const session = await env.DB.prepare(
        'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
      ).bind(token).first();
      if (session) userId = session.user_id;
    }

    const orderId = 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4).toUpperCase();

    await env.DB.prepare(
      `INSERT INTO orders (id, user_id, customer_name, customer_phone, customer_email, customer_address, items, subtotal, shipping, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      orderId, userId, customerName, customerPhone,
      customerEmail || '', customerAddress || '',
      JSON.stringify(items), subtotal || 0, shipping || 0, total || 0
    ).run();

    return json({ ok: true, orderId, message: 'Đặt hàng thành công!' });
  } catch (err) {
    return json({ ok: false, message: err.message }, 500);
  }
}

// GET /api/orders?token=xxx - Get orders for logged-in user
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return json({ ok: false, message: 'Vui lòng đăng nhập.' }, 401);
  }

  try {
    const session = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
    ).bind(token).first();

    if (!session) {
      return json({ ok: false, message: 'Phiên đăng nhập hết hạn.' }, 401);
    }

    const { results } = await env.DB.prepare(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(session.user_id).all();

    const orders = results.map(o => ({
      ...o,
      items: JSON.parse(o.items)
    }));

    return json({ ok: true, orders });
  } catch (err) {
    return json({ ok: false, message: err.message }, 500);
  }
}
