/* ===================================================
   API: /api/admin/dashboard - Admin Dashboard Data
   SECURITY: Strictly requires authorized admin session token
             (sinhngo110705, vuhoangnguyen3009)
   =================================================== */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Helper: Check authorized admin email (strictly sinhngo110705 and vuhoangnguyen3009)
function isAuthorizedAdminEmail(email) {
  if (!email) return false;
  const e = email.toLowerCase().trim();
  return e.includes('sinhngo110705') || e.includes('vuhoangnguyen3009');
}

// Helper: Verify admin token strictly
async function verifyAdmin(env, request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) return null;

  const session = await env.DB.prepare(
    'SELECT s.user_id, u.role, u.name, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime("now")'
  ).bind(token).first();

  if (!session) return null;
  // Strictly enforce admin role and authorized email
  if (session.role !== 'admin' || !isAuthorizedAdminEmail(session.email)) {
    return null;
  }
  return session;
}

// GET /api/admin/dashboard - Get overview stats + data
export async function onRequestGet(context) {
  const { env, request } = context;

  const admin = await verifyAdmin(env, request);
  if (!admin) {
    return json({ ok: false, message: 'Truy cập bị từ chối. Chỉ tài khoản Admin được cấp quyền (sinhngo110705, vuhoangnguyen3009) mới có quyền truy cập.' }, 403);
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
      const totalBlogs = await env.DB.prepare('SELECT COUNT(*) as count FROM blogs WHERE is_active = 1').first();
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
          totalBlogs: totalBlogs ? totalBlogs.count : 0,
          totalContacts: totalContacts.count,
          pendingOrders: pendingOrders.count,
          unreadContacts: unreadContacts.count,
        },
        recentOrders
      });
    }

    // ===== USERS WITH AGGREGATED STATS & ANTI-LAG PAGINATION =====
    if (section === 'users') {
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
      const limitRaw = parseInt(url.searchParams.get('limit') || '10', 10);
      // Supported limits: 10, 20, 50 (or capped at 100)
      const limit = [10, 20, 50].includes(limitRaw) ? limitRaw : 10;
      const search = (url.searchParams.get('search') || '').trim();
      const offset = (page - 1) * limit;

      const searchPattern = `%${search}%`;

      // Total count matching search
      const totalRow = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM users WHERE (COALESCE(name, "") LIKE ? OR COALESCE(email, "") LIKE ? OR COALESCE(phone, "") LIKE ?)'
      ).bind(searchPattern, searchPattern, searchPattern).first();
      const total = totalRow ? totalRow.count : 0;

      // Aggregated customer query: total_orders, delivering_orders, total_spent
      const { results } = await env.DB.prepare(`
        SELECT 
          u.id, 
          u.name, 
          u.email, 
          u.phone, 
          u.role, 
          u.created_at,
          COUNT(DISTINCT o.id) as total_orders,
          COUNT(DISTINCT CASE WHEN o.status NOT IN ('delivered', 'cancelled') AND o.id IS NOT NULL THEN o.id END) as delivering_orders,
          COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total ELSE 0 END), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON (o.user_id = u.id OR (u.email IS NOT NULL AND u.email != '' AND o.customer_email = u.email))
        WHERE (COALESCE(u.name, "") LIKE ? OR COALESCE(u.email, "") LIKE ? OR COALESCE(u.phone, "") LIKE ?)
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `).bind(searchPattern, searchPattern, searchPattern, limit, offset).all();

      return json({
        ok: true,
        users: results,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1
        }
      });
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
        'SELECT * FROM orders WHERE user_id = ? OR customer_email = ? ORDER BY created_at DESC'
      ).bind(userId, user.email).all();

      const parsedOrders = orders.map(o => ({ ...o, items: o.items ? JSON.parse(o.items) : [] }));
      const parsedCart = user.cart_items ? JSON.parse(user.cart_items) : [];

      return json({ ok: true, user, orders: parsedOrders, cart: parsedCart });
    }

    // ===== ORDERS =====
    if (section === 'orders') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM orders ORDER BY created_at DESC'
      ).all();
      const orders = results.map(o => ({ ...o, items: o.items ? JSON.parse(o.items) : [] }));
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

    // ===== BLOGS (WITH VIEWS & COMMENT COUNT) =====
    if (section === 'blogs') {
      const { results } = await env.DB.prepare(`
        SELECT 
          b.id, b.title, b.category, b.content, b.image_url, b.is_active,
          COALESCE(b.views, 0) as views,
          (SELECT COUNT(*) FROM blog_comments WHERE blog_id = b.id) as comment_count,
          b.created_at
        FROM blogs b
        ORDER BY b.created_at DESC
      `).all();
      return json({ ok: true, blogs: results });
    }

    // ===== BLOG COMMENTS FOR MODERATION =====
    if (section === 'blog_comments') {
      const blogId = url.searchParams.get('blogId');
      if (!blogId) return json({ ok: false, message: 'Thiếu blogId.' }, 400);

      const { results } = await env.DB.prepare(
        'SELECT id, blog_id, user_name, user_email, content, created_at FROM blog_comments WHERE blog_id = ? ORDER BY created_at DESC'
      ).bind(blogId).all();

      return json({ ok: true, comments: results });
    }

    // ===== SECURITY & BACKUP INFO =====
    if (section === 'security_info') {
      const { results: recentResets } = await env.DB.prepare(
        'SELECT id, email, otp_code, expires_at, used_at, created_at FROM password_resets ORDER BY created_at DESC LIMIT 20'
      ).all();

      const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
      const orderCount = await env.DB.prepare('SELECT COUNT(*) as count FROM orders').first();
      const blogCount = await env.DB.prepare('SELECT COUNT(*) as count FROM blogs').first();

      return json({
        ok: true,
        recentResets,
        databaseStats: {
          users: userCount ? userCount.count : 0,
          orders: orderCount ? orderCount.count : 0,
          blogs: blogCount ? blogCount.count : 0,
        }
      });
    }

    return json({ ok: false, message: 'Section không hợp lệ.' }, 400);

  } catch (err) {
    return json({ ok: false, message: err.message }, 500);
  }
}

// POST /api/admin/dashboard - Admin actions
export async function onRequestPost(context) {
  const { env, request } = context;

  const admin = await verifyAdmin(env, request);
  if (!admin) {
    return json({ ok: false, message: 'Truy cập bị từ chối. Chỉ tài khoản Admin được cấp quyền (sinhngo110705, vuhoangnguyen3009) mới có quyền truy cập.' }, 403);
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
        await env.DB.prepare(
          `UPDATE products SET name=?, description=?, price=?, original_price=?, category=?, image_url=?, badge=?, tags=?, is_active=? WHERE id=?`
        ).bind(name, description, price, original_price || null, category, image_url, badge || null, JSON.stringify(tags || []), is_active ?? 1, id).run();
      } else {
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

    // Add/Update Blog
    if (action === 'saveBlog') {
      const { blog } = body;
      if (!blog || !blog.title || !blog.content) {
        return json({ ok: false, message: 'Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết.' }, 400);
      }
      const { id, title, category, content, image_url, is_active } = blog;

      if (id) {
        await env.DB.prepare(
          `UPDATE blogs SET title=?, category=?, content=?, image_url=?, is_active=? WHERE id=?`
        ).bind(title.trim(), category || 'Dinh Dưỡng', content.trim(), image_url || null, is_active ?? 1, id).run();
      } else {
        const newId = 'blg_' + Date.now();
        await env.DB.prepare(
          `INSERT INTO blogs (id, title, category, content, image_url, is_active, views) VALUES (?,?,?,?,?,?,0)`
        ).bind(newId, title.trim(), category || 'Dinh Dưỡng', content.trim(), image_url || null, is_active ?? 1).run();
      }
      return json({ ok: true, message: 'Lưu bài viết thành công.' });
    }

    // Delete Blog
    if (action === 'deleteBlog') {
      const { blogId } = body;
      if (!blogId) return json({ ok: false, message: 'Thiếu blogId.' }, 400);
      // Also delete comments
      await env.DB.prepare('DELETE FROM blog_comments WHERE blog_id = ?').bind(blogId).run();
      await env.DB.prepare('DELETE FROM blogs WHERE id = ?').bind(blogId).run();
      return json({ ok: true, message: 'Đã xóa bài viết và toàn bộ bình luận liên quan.' });
    }

    // Delete Blog Comment (Moderation)
    if (action === 'deleteBlogComment') {
      const { commentId } = body;
      if (!commentId) return json({ ok: false, message: 'Thiếu commentId.' }, 400);
      await env.DB.prepare('DELETE FROM blog_comments WHERE id = ?').bind(commentId).run();
      return json({ ok: true, message: 'Đã xóa bình luận.' });
    }

    // Change user role (Strictly Admin only, only allow admin role for sinhngo110705 or vuhoangnguyen3009)
    if (action === 'changeUserRole') {
      const { userId, newRole } = body;
      if (!['user', 'manager', 'admin'].includes(newRole)) return json({ ok: false, message: 'Vai trò không hợp lệ.' }, 400);

      const targetUser = await env.DB.prepare('SELECT id, email, role FROM users WHERE id = ?').bind(userId).first();
      if (!targetUser) return json({ ok: false, message: 'Không tìm thấy user.' }, 404);

      if (newRole === 'admin' && !isAuthorizedAdminEmail(targetUser.email)) {
        return json({
          ok: false,
          message: 'Chỉ tài khoản có email sinhngo110705 hoặc vuhoangnguyen3009 mới có thể nhận quyền Admin.'
        }, 403);
      }

      if (admin.user_id === userId && newRole !== 'admin') {
        return json({ ok: false, message: 'Bạn không thể tự hạ quyền của chính mình.' }, 400);
      }

      await env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(newRole, userId).run();
      return json({ ok: true, message: 'Cập nhật vai trò thành công.' });
    }

    // Delete user account (cascade: sessions → orders → user)
    if (action === 'deleteUser') {
      const { userId } = body;
      if (!userId) return json({ ok: false, message: 'Thiếu userId.' }, 400);

      const targetUser = await env.DB.prepare('SELECT role, email FROM users WHERE id = ?').bind(userId).first();
      if (!targetUser) return json({ ok: false, message: 'Không tìm thấy user.' }, 404);
      if (targetUser.role === 'admin' || isAuthorizedAdminEmail(targetUser.email)) {
        return json({ ok: false, message: 'Không thể xóa tài khoản Admin.' }, 403);
      }

      // Cascade delete
      await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run();
      await env.DB.prepare('DELETE FROM orders WHERE user_id = ?').bind(userId).run();
      await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
      return json({ ok: true, message: 'Đã xóa tài khoản và dữ liệu liên quan.' });
    }

    // Delete order
    if (action === 'deleteOrder') {
      const { orderId } = body;
      if (!orderId) return json({ ok: false, message: 'Thiếu orderId.' }, 400);
      await env.DB.prepare('DELETE FROM orders WHERE id = ?').bind(orderId).run();
      return json({ ok: true, message: 'Đã xóa đơn hàng.' });
    }

    // Export database backup snapshot as JSON
    if (action === 'exportBackup') {
      const { results: users } = await env.DB.prepare('SELECT id, name, email, phone, role, created_at FROM users').all();
      const { results: orders } = await env.DB.prepare('SELECT * FROM orders').all();
      const { results: blogs } = await env.DB.prepare('SELECT * FROM blogs').all();
      const { results: comments } = await env.DB.prepare('SELECT * FROM blog_comments').all();
      const { results: products } = await env.DB.prepare('SELECT * FROM products').all();
      const { results: contacts } = await env.DB.prepare('SELECT * FROM contacts').all();

      return json({
        ok: true,
        backup: {
          exportedAt: new Date().toISOString(),
          system: 'Sữa Hạt Dana Admin Backup',
          users,
          orders,
          blogs,
          comments,
          products,
          contacts
        }
      });
    }

    return json({ ok: false, message: 'Action không hợp lệ.' }, 400);

  } catch (err) {
    return json({ ok: false, message: err.message }, 500);
  }
}

