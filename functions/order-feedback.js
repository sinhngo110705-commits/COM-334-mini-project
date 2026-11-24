export function ensureOrderFeedback(db) {
  return db.prepare(`CREATE TABLE IF NOT EXISTS order_feedback (
    order_id TEXT PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
    guest_token_hash TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL DEFAULT '',
    created_at TEXT
  )`).run();
}

export async function hashFeedbackToken(token) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function recordFeedback(db, body, json) {
  const { orderId, rating, token, feedbackToken } = body;
  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
  if (typeof orderId !== 'string' || !orderId || !Number.isInteger(rating) || rating < 1 || rating > 5 ||
      (body.comment != null && typeof body.comment !== 'string') || comment.length > 1000) {
    return json({ ok: false, message: 'Chọn từ 1 đến 5 sao và nhập góp ý tối đa 1.000 ký tự.' }, 400);
  }

  let result;
  let order;
  if (typeof feedbackToken === 'string' && /^[0-9a-f-]{36}$/i.test(feedbackToken)) {
    const hash = await hashFeedbackToken(feedbackToken);
    result = await db.prepare(
      `UPDATE order_feedback SET rating = ?, comment = ?, created_at = datetime('now')
       WHERE order_id = ? AND guest_token_hash = ? AND rating IS NULL
       AND EXISTS (SELECT 1 FROM orders WHERE id = ? AND user_id IS NULL AND status <> 'cancelled')`
    ).bind(rating, comment, orderId, hash, orderId).run();
    if (!result.meta.changes) {
      order = await db.prepare(
        `SELECT o.status, f.rating FROM orders o JOIN order_feedback f ON f.order_id = o.id
         WHERE o.id = ? AND o.user_id IS NULL AND f.guest_token_hash = ?`
      ).bind(orderId, hash).first();
    }
  } else {
    const session = typeof token === 'string' && token ? await db.prepare(
      'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
    ).bind(token).first() : null;
    if (!session) return json({ ok: false, message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' }, 401);

    result = await db.prepare(
      `INSERT INTO order_feedback (order_id, rating, comment, created_at)
       SELECT id, ?, ?, datetime('now') FROM orders WHERE id = ? AND user_id = ? AND status <> 'cancelled'
       ON CONFLICT(order_id) DO NOTHING`
    ).bind(rating, comment, orderId, session.user_id).run();
    if (!result.meta.changes) {
      order = await db.prepare(
        `SELECT o.status, f.rating FROM orders o LEFT JOIN order_feedback f ON f.order_id = o.id
         WHERE o.id = ? AND o.user_id = ?`
      ).bind(orderId, session.user_id).first();
    }
  }

  if (result.meta.changes) return json({ ok: true, message: 'Cảm ơn bạn đã gửi phản hồi!' });
  if (!order) return json({ ok: false, message: 'Không tìm thấy đơn hàng để phản hồi.' }, 404);
  if (order.rating != null) {
    return json({ ok: false, alreadySubmitted: true, message: 'Bạn đã gửi phản hồi cho đơn hàng này.' }, 409);
  }
  return json({ ok: false, message: 'Đơn hàng đã hủy không thể gửi phản hồi.' }, 409);
}
