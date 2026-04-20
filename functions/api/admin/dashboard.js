/* ===================================================
   API: /api/admin/dashboard - Admin Dashboard Data
   SECURITY: Requires admin session token
   =================================================== */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Helper: Verify admin token
async function verifyAdmin(env, request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) return null;

  const session = await env.DB.prepare(
    'SELECT s.user_id, u.role, u.name, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime("now")'
  ).bind(token).first();

  if (!session || session.role !== 'admin') return null;
  return session;
}

// GET /api/admin/dashboard - Get overview stats + data
export async function onRequestGet(context) {
  const { env, request } = context;

  const admin = await verifyAdmin(env, request);
  if (!admin) {
    return json({ ok: false, message: 'Truy cập bị từ chối. Bạn không phải admin.' }, 403);
  }

  try {
    const url = new URL(request.url);
    const section = url.searchParams.get('section') || 'overview';

    // ===== OVERVIEW =====
    if (section === 'overview') {
      const totalUsers = await env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE role = "user"').first();
      const totalOrders = await env.DB.prepare('SELECT COUNT(*) as count FROM orders').first();
      const totalRevenue = await env.DB.prepare('SELECT COALESCE(SUM(total), 0) as sum FROM orders WHERE status != "cancelled"').first();
      const totalContacts = await env.DB.prepare('SELECT COUNT(*) as count FROM contacts').first();
      const totalProducts = await env.DB.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').first();
      const pendingOrders = await env.DB.prepare('SELECT COUNT(*) as count FROM orders WHERE status = "pending"').first();
      const unreadContacts = await env.DB.prepare('SELECT COUNT(*) as count FROM contacts WHERE is_read = 0').first();

      // Recent 5 orders
      const { results: recentOrders } = await env.DB.prepare(
        'SELECT id, customer_name, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5'
      ).all();

      return json({
        ok: true,
        stats: {
          totalUsers: totalUsers.count,
          totalOrders: totalOrders.count,
          totalRevenue: totalRevenue.sum,
          totalProducts: totalProducts.count,
          totalContacts: totalContacts.count,
          pendingOrders: pendingOrders.count,
          unreadContacts: unreadContacts.count,
        },
        recentOrders
      });
    }

    // ===== USERS =====
    if (section === 'users') {
      const { results } = await env.DB.prepare(
        'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
      ).all();
      return json({ ok: true, users: results });
    }

    // ===== USER DETAILS =====
    if (section === 'user_details') {
      const userId = url.searchParams.get('userId');
      if (!userId) return json({ ok: false, message: 'Thiếu userId.' }, 400);

      const user = await env.DB.prepare(
        'SELECT id, name, email, phone, role, created_at, cart_items FROM users WHERE id = ?'
      ).bind(userId).first();

      if (!user) return json({ ok: false, message: 'Không tìm thấy user.' }, 404);

      const { results: orders } = await env.DB.prepare(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
      ).bind(userId).all();

      const parsedOrders = orders.map(o => ({ ...o, items: JSON.parse(o.items) }));
      const parsedCart = user.cart_items ? JSON.parse(user.cart_items) : [];

      return json({ ok: true, user, orders: parsedOrders, cart: parsedCart });
    }

    // ===== ORDERS =====
    if (section === 'orders') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM orders ORDER BY created_at DESC'
      ).all();
      const orders = results.map(o => ({ ...o, items: JSON.parse(o.items) }));
      return json({ ok: true, orders });
    }

    // ===== CONTACTS =====
    if (section === 'contacts') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM contacts ORDER BY created_at DESC'
      ).all();
      return json({ ok: true, contacts: results });
    }

    // ===== PRODUCTS =====
    if (section === 'products') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM products ORDER BY created_at DESC'
      ).all();
      const products = results.map(p => ({ ...p, tags: p.tags ? JSON.parse(p.tags) : [] }));
      return json({ ok: true, products });
    }

    return json({ ok: false, message: 'Section không hợp lệ.' }, 400);

  } catch (err) {
    return json({ ok: false, message: err.message }, 500);
  }
}

// POST /api/admin/dashboard - Admin actions (update order status, mark contact read, etc.)
export async function onRequestPost(context) {
  const { env, request } = context;

  const admin = await verifyAdmin(env, request);
  if (!admin) {
    return json({ ok: false, message: 'Truy cập bị từ chối.' }, 403);
  }

  try {
    const body = await request.json();
    const { action } = body;

    // Update order status
    if (action === 'updateOrderStatus') {
      const { orderId, status } = body;
      await env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(status, orderId).run();
      return json({ ok: true });
    }

    // Mark contact as read
    if (action === 'markContactRead') {
      const { contactId } = body;
      await env.DB.prepare('UPDATE contacts SET is_read = 1 WHERE id = ?').bind(contactId).run();
      return json({ ok: true });
    }

    // Add/Update product
    if (action === 'saveProduct') {
      const { product } = body;
      const { id, name, description, price, original_price, category, image_url, badge, tags, is_active } = product;

      if (id) {
        // Update existing
        await env.DB.prepare(
          `UPDATE products SET name=?, description=?, price=?, original_price=?, category=?, image_url=?, badge=?, tags=?, is_active=? WHERE id=?`
        ).bind(name, description, price, original_price || null, category, image_url, badge || null, JSON.stringify(tags || []), is_active ?? 1, id).run();
      } else {
        // Insert new
        const newId = 'sp_' + Date.now();
        await env.DB.prepare(
          `INSERT INTO products (id, name, description, price, original_price, category, image_url, badge, tags, is_active) VALUES (?,?,?,?,?,?,?,?,?,?)`
        ).bind(newId, name, description, price, original_price || null, category, image_url, badge || null, JSON.stringify(tags || []), is_active ?? 1).run();
      }
      return json({ ok: true });
    }

    // Delete product 
    if (action === 'deleteProduct') {
      const { productId } = body;
      await env.DB.prepare('UPDATE products SET is_active = 0 WHERE id = ?').bind(productId).run();
      return json({ ok: true });
    }

    return json({ ok: false, message: 'Action không hợp lệ.' }, 400);

  } catch (err) {
    return json({ ok: false, message: err.message }, 500);
  }
}
