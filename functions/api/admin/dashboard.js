import { normalizeBlog } from '../../blog-record.js';
import { safeUrl } from '../../../assets/js/site-content.js';
import { canBeAdmin, isDanaAdminAccount, isSeedPasswordHash } from '../../admin-access.js';

const DEMO_ORDER_ID = 'ORD_usr_[0-9][0-9]_[0-9]*';
const CUSTOMER_ORDER_MATCH = `(
  o.user_id = u.id OR (
    o.user_id IS NULL AND trim(u.email) <> '' AND lower(trim(o.customer_email)) = lower(trim(u.email))
  )
)`;

/* ===================================================
   API: /api/admin/dashboard - Admin Dashboard Data
   SECURITY: Requires an authorized admin session token
   =================================================== */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Helper: Verify admin token strictly
async function verifyAdmin(env, request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) return null;

  const session = await env.DB.prepare(
    'SELECT s.user_id, u.role, u.name, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND julianday(s.expires_at) > julianday("now")'
  ).bind(token).first();

  if (!session) return null;
  // Strictly enforce admin role and authorized email
  if (session.role !== 'admin' || !canBeAdmin(session)) {
    return null;
  }
  return session;
}

// GET /api/admin/dashboard - Get overview stats + data
export async function onRequestGet(context) {
  const { env, request } = context;

  const admin = await verifyAdmin(env, request);
  if (!admin) {
    return json({ ok: false, message: 'Tài khoản này chưa có quyền quản trị.' }, 403);
  }

  try {
    const url = new URL(request.url);
    const section = url.searchParams.get('section') || 'overview';

    // ===== OVERVIEW =====
    if (section === 'overview') {
      const [totals, recent] = await env.DB.batch([
        env.DB.prepare(`
          SELECT
            (SELECT COUNT(*) FROM users WHERE role = 'user' AND password_hash <> 'dummy_hash') AS totalUsers,
            (SELECT COUNT(*) FROM products WHERE is_active = 1) AS totalProducts,
            (SELECT COUNT(*) FROM blogs WHERE is_active = 1) AS totalBlogs,
            (SELECT COUNT(*) FROM contacts) AS totalContacts,
            (SELECT COUNT(*) FROM contacts WHERE is_read = 0) AS unreadContacts,
            COUNT(*) AS totalOrders,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pendingOrders,
            COALESCE(SUM(CASE WHEN status = 'delivered' THEN total END), 0) AS deliveredOrderValue
          FROM orders WHERE id NOT GLOB '${DEMO_ORDER_ID}'
        `),
        env.DB.prepare(`
          SELECT id, customer_name, total, status, created_at FROM orders
          WHERE id NOT GLOB '${DEMO_ORDER_ID}' ORDER BY created_at DESC, id DESC LIMIT 5
        `)
      ]);
      return json({ ok: true, stats: totals.results[0], recentOrders: recent.results });
    }

    // ===== USER SEARCH, PAGINATION AND ORDER TOTALS =====
    if (section === 'users') {
      const requestedPage = Math.max(1, parseInt(url.searchParams.get('page'), 10) || 1);
      const limitRaw = parseInt(url.searchParams.get('limit') || '10', 10);
      const limit = [10, 20, 50].includes(limitRaw) ? limitRaw : 10;
      const search = (url.searchParams.get('search') || '').trim();

      const searchPattern = `%${search}%`;

      // Total count matching search
      const totalRow = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM users WHERE (COALESCE(name, "") LIKE ? OR COALESCE(email, "") LIKE ? OR COALESCE(phone, "") LIKE ?)'
      ).bind(searchPattern, searchPattern, searchPattern).first();
      const total = totalRow ? totalRow.count : 0;
      const totalPages = Math.ceil(total / limit) || 1;
      const page = Math.min(requestedPage, totalPages);
      const offset = (page - 1) * limit;

      // Aggregated customer query: total_orders, delivering_orders, total_spent
      const { results } = await env.DB.prepare(`
        SELECT 
          u.id, 
          u.name, 
          u.email, 
          u.phone, 
          u.role, 
          u.created_at,
          u.password_hash = 'dummy_hash' AS is_demo,
          COUNT(DISTINCT o.id) as total_orders,
          COUNT(DISTINCT CASE WHEN o.status IN ('pending', 'confirmed') THEN o.id END) as delivering_orders,
          COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.total END), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON ${CUSTOMER_ORDER_MATCH}
        WHERE (COALESCE(u.name, "") LIKE ? OR COALESCE(u.email, "") LIKE ? OR COALESCE(u.phone, "") LIKE ?)
        GROUP BY u.id
        ORDER BY u.created_at DESC, u.id DESC
        LIMIT ? OFFSET ?
      `).bind(searchPattern, searchPattern, searchPattern, limit, offset).all();

      return json({
        ok: true,
        users: results,
        pagination: {
          total,
          page,
          limit,
          totalPages
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
        `SELECT o.* FROM orders o JOIN users u ON u.id = ? AND ${CUSTOMER_ORDER_MATCH}
         ORDER BY o.created_at DESC, o.id DESC`
      ).bind(userId).all();

      const parsedOrders = orders.map(o => ({ ...o, items: o.items ? JSON.parse(o.items) : [] }));
      const parsedCart = user.cart_items ? JSON.parse(user.cart_items) : [];

      return json({ ok: true, user, orders: parsedOrders, cart: parsedCart });
    }

    // ===== ORDERS =====
    if (section === 'orders') {
      const { results } = await env.DB.prepare(
        `SELECT o.*, o.id GLOB '${DEMO_ORDER_ID}' AS is_demo,
         f.rating AS feedback_rating, f.comment AS feedback_comment, f.created_at AS feedback_at
         FROM orders o LEFT JOIN order_feedback f ON f.order_id = o.id ORDER BY o.created_at DESC, o.id DESC`
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
      return json({ ok: true, blogs: results.map(normalizeBlog) });
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
    return json({ ok: false, message: 'Tài khoản này chưa có quyền quản trị.' }, 403);
  }

  try {
    const body = await request.json();
    const { action } = body;

    // Update order status
    if (action === 'updateOrderStatus') {
      const { orderId, status } = body;
      if (!orderId || !['pending', 'confirmed', 'delivered', 'cancelled'].includes(status)) {
        return json({ ok: false, message: 'Trạng thái đơn hàng không hợp lệ.' }, 400);
      }
      const result = await env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(status, orderId).run();
      if (!result.meta.changes) return json({ ok: false, message: 'Không tìm thấy đơn hàng.' }, 404);
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
      const title = typeof blog?.title === 'string' ? blog.title.trim() : '';
      const content = typeof blog?.content === 'string' ? blog.content.trim() : '';
      if (!title || !content) {
        return json({ ok: false, message: 'Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết.' }, 400);
      }
      const { id, category, image_url, is_active } = blog;
      if (title.length > 200 || content.length > 250000) {
        return json({ ok: false, message: 'Tiêu đề tối đa 200 ký tự và nội dung tối đa 250.000 ký tự.' }, 400);
      }
      if (image_url && !safeUrl(image_url, new URL(request.url).origin)) {
        return json({ ok: false, message: 'Liên kết ảnh bìa không hợp lệ.' }, 400);
      }

      let blogId = id;
      if (id) {
        const result = await env.DB.prepare(
          `UPDATE blogs SET title=?, category=?, content=?, image_url=?, is_active=? WHERE id=?`
        ).bind(title, category || 'Dinh Dưỡng', content, image_url || null, is_active ?? 1, id).run();
        if (!result.meta.changes) return json({ ok: false, message: 'Không tìm thấy bài viết để cập nhật.' }, 404);
      } else {
        blogId = 'blg_' + crypto.randomUUID();
        await env.DB.prepare(
          `INSERT INTO blogs (id, title, category, content, image_url, is_active, views) VALUES (?,?,?,?,?,?,0)`
        ).bind(blogId, title, category || 'Dinh Dưỡng', content, image_url || null, is_active ?? 1).run();
      }
      return json({ ok: true, blogId, message: 'Lưu bài viết thành công.' });
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

    // Change the role of a user approved for admin access.
    if (action === 'changeUserRole') {
      const { userId, newRole } = body;
      if (!['user', 'manager', 'admin'].includes(newRole)) return json({ ok: false, message: 'Vai trò không hợp lệ.' }, 400);

      const targetUser = await env.DB.prepare('SELECT id, email, role, password_hash FROM users WHERE id = ?').bind(userId).first();
      if (!targetUser) return json({ ok: false, message: 'Không tìm thấy user.' }, 404);

      if (newRole === 'admin' && !canBeAdmin(targetUser)) {
        return json({
          ok: false,
          message: 'Tài khoản này chưa được phép nhận quyền Admin.'
        }, 403);
      }
      if (newRole === 'admin' && isDanaAdminAccount(targetUser) && isSeedPasswordHash(targetUser.password_hash)) {
        return json({ ok: false, message: 'Tài khoản cần mật khẩu riêng trước khi nhận quyền Admin.' }, 409);
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

      const targetUser = await env.DB.prepare('SELECT id, role, email FROM users WHERE id = ?').bind(userId).first();
      if (!targetUser) return json({ ok: false, message: 'Không tìm thấy user.' }, 404);
      if (targetUser.role === 'admin' || canBeAdmin(targetUser)) {
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
      const { results: orderFeedback } = await env.DB.prepare(
        'SELECT order_id, rating, comment, created_at FROM order_feedback WHERE rating IS NOT NULL'
      ).all();
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
          orderFeedback,
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

