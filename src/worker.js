/* ===================================================
   Cloudflare Worker - Main Entry Point
   Sữa Hạt Dana - hnguyenworks.id.vn
   Routes all /api/* requests to handlers
   =================================================== */

import { onRequestPost as authPost } from '../functions/api/auth.js';
import { onRequestGet as cartGet, onRequestPost as cartPost } from '../functions/api/cart.js';
import { onRequestGet as productsGet } from '../functions/api/products.js';
import { onRequestPost as ordersPost, onRequestGet as ordersGet, onRequestPut as ordersPut } from '../functions/api/orders.js';
import { onRequestPost as contactPost } from '../functions/api/contact.js';
import { onRequestPost as uploadPost } from '../functions/api/upload.js';
import { onRequestGet as dashboardGet, onRequestPost as dashboardPost } from '../functions/api/admin/dashboard.js';
import { onRequestGet as blogsGet, onRequestPost as blogsPost } from '../functions/api/blogs.js';

// CORS headers
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function corsResponse(response) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

// Auto-migration: ensure tables, columns, roles and sample data exist
async function runMigrations(env) {
  try {
    // 1. Ensure blogs table and views column
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT,
      content TEXT,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      views INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category)`).run();

    try {
      await env.DB.prepare(`ALTER TABLE blogs ADD COLUMN views INTEGER DEFAULT 0`).run();
    } catch(e) {
      // Column views already exists
    }

    // 2. Blog comments table
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS blog_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      blog_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (blog_id) REFERENCES blogs(id)
    )`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_blog_comments_blog ON blog_comments(blog_id)`).run();

    // 3. Password resets table (for OTP recovery)
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email)`).run();

    // 4. Update admin roles: strictly enforce admin role ONLY for sinhngo110705 and vuhoangnguyen3009
    await env.DB.prepare(`UPDATE users SET role = 'user' WHERE email NOT LIKE '%sinhngo110705%' AND email NOT LIKE '%vuhoangnguyen3009%' AND role = 'admin'`).run();
    
    const sinhExisting = await env.DB.prepare(`SELECT id FROM users WHERE email LIKE '%sinhngo110705%'`).first();
    if (sinhExisting) {
      await env.DB.prepare(`UPDATE users SET role = 'admin', password_hash = 'ea554d403eec8485c738aa8ec19bf7a6f5bd229b4b1d0f089a1eae749aff2115' WHERE id = ?`).bind(sinhExisting.id).run();
    } else {
      await env.DB.prepare(`
        INSERT INTO users (id, name, email, password_hash, phone, role) 
        VALUES ('admin_sinhngo', 'Sinh Ngô Admin', 'sinhngo110705@gmail.com', 'ea554d403eec8485c738aa8ec19bf7a6f5bd229b4b1d0f089a1eae749aff2115', '0974445624', 'admin')
      `).run();
    }

    const vuExisting = await env.DB.prepare(`SELECT id FROM users WHERE email LIKE '%vuhoangnguyen3009%'`).first();
    if (vuExisting) {
      await env.DB.prepare(`UPDATE users SET role = 'admin', password_hash = 'ea554d403eec8485c738aa8ec19bf7a6f5bd229b4b1d0f089a1eae749aff2115' WHERE id = ?`).bind(vuExisting.id).run();
    } else {
      await env.DB.prepare(`
        INSERT INTO users (id, name, email, password_hash, phone, role) 
        VALUES ('admin_vuhoangnguyen', 'Vũ Hoàng Nguyên Admin', 'vuhoangnguyen3009@gmail.com', 'ea554d403eec8485c738aa8ec19bf7a6f5bd229b4b1d0f089a1eae749aff2115', '0901234567', 'admin')
      `).run();
    }

    // 5. Seed blogs if not seeded
    const existing = await env.DB.prepare("SELECT COUNT(*) as c FROM blogs WHERE id = 'blg_dinh_duong_1'").first();
    if (!existing || existing.c === 0) {
      const BLOGS = [
        {
          id: 'blg_dinh_duong_1',
          title: 'Sữa Hạt – "Vàng Trắng" Của Thế Kỷ XXI Trong Dinh Dưỡng Hiện Đại',
          category: 'Dinh Dưỡng',
          image_url: '/assets/images/blog/blog_dinh_duong_1.png',
          days_ago: 9,
          content: `<div class="blog-article"><img src="/assets/images/blog/blog_dinh_duong_1.png" alt="Sữa Hạt và các nguyên liệu tự nhiên" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" /><p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Trong bối cảnh xu hướng ăn lành mạnh ngày càng phổ biến, sữa hạt đã trở thành lựa chọn hàng đầu của hàng triệu người trên thế giới – từ vận động viên, người ăn chay cho đến các gia đình trẻ muốn kiểm soát sức khoẻ tốt hơn.</p><h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">🌿 Sữa Hạt Là Gì? Tại Sao Nó Đặc Biệt?</h3><p style="line-height:1.9;color:#374151;margin-bottom:20px">Sữa hạt được sản xuất bằng cách ngâm, xay và lọc các loại hạt như <strong>hạnh nhân, hạt điều, óc chó, hạt bí, macadamia</strong>... với nước tinh khiết. Không có lactose, không có hormone nhân tạo – đây là thức uống thuần thiên nhiên hoàn toàn.</p><div style="background:linear-gradient(135deg,#f0faf1,#e8f5e9);border-left:4px solid #6B8F71;padding:24px;border-radius:12px;margin:28px 0"><p style="margin:0;color:#2d5a2d;font-weight:500;line-height:1.8">💡 <strong>Sự khác biệt cốt lõi:</strong> Không giống sữa bò công nghiệp, sữa hạt tự nấu <em>không chứa chất bảo quản, không màu nhân tạo</em> và nguyên liệu hoàn toàn kiểm soát được từ nguồn gốc đến ly uống.</p></div></div>`
        },
        {
          id: 'blg_dinh_duong_2',
          title: 'Hạnh Nhân vs Hạt Điều: Chọn Loại Sữa Hạt Nào Phù Hợp Nhất Với Bạn?',
          category: 'Dinh Dưỡng',
          image_url: '/assets/images/blog/blog_dinh_duong_2.png',
          days_ago: 13,
          content: `<div class="blog-article"><img src="/assets/images/blog/blog_dinh_duong_2.png" alt="Sữa hạnh nhân thuần tự nhiên" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" /><p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Khi lần đầu tiếp cận với thế giới sữa hạt, câu hỏi phổ biến nhất mà khách hàng Dana thường hỏi là: <em>"Tôi nên chọn hạnh nhân hay hạt điều?"</em> Bài viết này sẽ giúp bạn trả lời dứt khoát câu hỏi đó.</p><h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">🌰 Sữa Hạnh Nhân – Thanh Tao & Nhẹ Nhàng</h3><div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:24px"><h4 style="color:#92400e;margin-bottom:12px">🏆 Hạnh Nhân Nổi Bật Với:</h4><ul style="color:#78350f;line-height:2;margin:0;padding-left:20px"><li><strong>Vitamin E</strong> cao nhất trong các loại hạt – chống lão hóa, bảo vệ da</li><li><strong>Canxi tự nhiên</strong> – hỗ trợ xương chắc khoẻ</li></ul></div></div>`
        },
        {
          id: 'blg_cong_thuc_1',
          title: 'Công Thức Làm Sữa Hạt Điều Tại Nhà Chỉ Trong 15 Phút – Ngon Hơn Mua Ngoài',
          category: 'Công Thức',
          image_url: '/assets/images/blog/blog_cong_thuc_1.png',
          days_ago: 5,
          content: `<div class="blog-article"><img src="/assets/images/blog/blog_cong_thuc_1.png" alt="Quy trình làm sữa hạt tại nhà" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" /><p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Sữa hạt điều tự nấu có vị ngon hơn hẳn, không chứa chất bảo quản, và bạn hoàn toàn kiểm soát được độ ngọt.</p></div>`
        },
        {
          id: 'blg_cong_thuc_2',
          title: 'Smoothie Bowl Sữa Hạt 5 Màu – Bữa Sáng Vừa Đẹp Vừa Dinh Dưỡng Trong 10 Phút',
          category: 'Công Thức',
          image_url: '/assets/images/blog/blog_cong_thuc_2.png',
          days_ago: 28,
          content: `<div class="blog-article"><img src="/assets/images/blog/blog_cong_thuc_2.png" alt="Smoothie Bowl màu sắc" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" /><p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Một bữa sáng vừa instagram-worthy, vừa cung cấp đủ năng lượng cho ngày dài năng động.</p></div>`
        },
        {
          id: 'blg_fitness_1',
          title: 'Sữa Hạt Và Thể Hình: Bí Kíp Phục Hồi Sau Tập Luyện Của Các Vận Động Viên',
          category: 'Fitness',
          image_url: '/assets/images/blog/blog_fitness_1.png',
          days_ago: 7,
          content: `<div class="blog-article"><img src="/assets/images/blog/blog_fitness_1.png" alt="Vận động viên uống sữa hạt" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" /><p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">35 phút sau khi tập luyện cường độ cao là "cửa sổ vàng" để tái tạo cơ bắp.</p></div>`
        },
        {
          id: 'blg_gia_dinh_1',
          title: 'Sữa Hạt Cho Cả Gia Đình: Từ Em Bé Đến Ông Bà – Ai Cũng Uống Được!',
          category: 'Gia Đình',
          image_url: '/assets/images/blog/blog_gia_dinh_1.png',
          days_ago: 10,
          content: `<div class="blog-article"><img src="/assets/images/blog/blog_gia_dinh_1.png" alt="Gia đình hạnh phúc dùng sữa hạt" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" /><p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Một sản phẩm tốt cho mọi thành viên trong gia đình – đó là giá trị cốt lõi mà Sữa Hạt Dana mang lại.</p></div>`
        }
      ];

      for (const blog of BLOGS) {
        const offset = `-${blog.days_ago} days`;
        await env.DB.prepare(
          `INSERT OR REPLACE INTO blogs (id, title, category, content, image_url, is_active, views, created_at) VALUES (?,?,?,?,?,1, 50, datetime('now', ?))`
        ).bind(blog.id, blog.title, blog.category, blog.content, blog.image_url, offset).run();
      }
    }

    // 6. Seed sample blog comments and views if needed
    const existingComments = await env.DB.prepare('SELECT COUNT(*) as c FROM blog_comments').first();
    if (!existingComments || existingComments.c === 0) {
      await env.DB.prepare(`
        INSERT INTO blog_comments (blog_id, user_name, user_email, content, created_at) VALUES 
        ('blg_dinh_duong_1', 'Minh Anh', 'minhanh@gmail.com', 'Bài viết rất bổ ích, mình đã chuyển hẳn sang sữa hạt hạnh nhân mỗi sáng!', datetime('now', '-5 days')),
        ('blg_dinh_duong_1', 'Hoàng Nam', 'nam.fitness@gmail.com', 'Bảng so sánh dinh dưỡng rất trực quan, cảm ơn Dana nhé!', datetime('now', '-3 days')),
        ('blg_cong_thuc_1', 'Thanh Trúc', 'tructruc@yahoo.com', 'Mình vừa thử làm theo công thức này sáng nay, sữa thơm và béo mịn tuyệt vời!', datetime('now', '-2 days'))
      `).run();
      await env.DB.prepare(`UPDATE blogs SET views = 142 WHERE id = 'blg_dinh_duong_1'`).run();
      await env.DB.prepare(`UPDATE blogs SET views = 98 WHERE id = 'blg_dinh_duong_2'`).run();
      await env.DB.prepare(`UPDATE blogs SET views = 215 WHERE id = 'blg_cong_thuc_1'`).run();
      await env.DB.prepare(`UPDATE blogs SET views = 76 WHERE id = 'blg_cong_thuc_2'`).run();
      await env.DB.prepare(`UPDATE blogs SET views = 189 WHERE id = 'blg_fitness_1'`).run();
      await env.DB.prepare(`UPDATE blogs SET views = 112 WHERE id = 'blg_gia_dinh_1'`).run();
    }

    // 7. Seed sample customers and orders for anti-lag pagination (10, 20, 50) testing
    const userCountRow = await env.DB.prepare('SELECT COUNT(*) as c FROM users WHERE role = "user"').first();
    if (userCountRow && userCountRow.c < 12) {
      const SAMPLE_CUSTOMERS = [
        { id: 'usr_01', name: 'Nguyễn Thị Mai', email: 'mai.nguyen@gmail.com', phone: '0912345601', orderCount: 3, delivering: 1, total: 450000 },
        { id: 'usr_02', name: 'Trần Văn Hùng', email: 'hung.tran@gmail.com', phone: '0912345602', orderCount: 2, delivering: 0, total: 270000 },
        { id: 'usr_03', name: 'Lê Thị Thu', email: 'thu.le@gmail.com', phone: '0912345603', orderCount: 5, delivering: 2, total: 890000 },
        { id: 'usr_04', name: 'Phạm Minh Đức', email: 'duc.pham@gmail.com', phone: '0912345604', orderCount: 1, delivering: 1, total: 180000 },
        { id: 'usr_05', name: 'Hoàng Anh Tuấn', email: 'tuan.hoang@gmail.com', phone: '0912345605', orderCount: 4, delivering: 0, total: 620000 },
        { id: 'usr_06', name: 'Đỗ Bích Phương', email: 'phuong.do@gmail.com', phone: '0912345606', orderCount: 6, delivering: 1, total: 1150000 },
        { id: 'usr_07', name: 'Vũ Đức Thịnh', email: 'thinh.vu@gmail.com', phone: '0912345607', orderCount: 0, delivering: 0, total: 0 },
        { id: 'usr_08', name: 'Bùi Lan Hương', email: 'huong.bui@gmail.com', phone: '0912345608', orderCount: 2, delivering: 1, total: 340000 },
        { id: 'usr_09', name: 'Ngô Quốc Bảo', email: 'bao.ngo@gmail.com', phone: '0912345609', orderCount: 3, delivering: 0, total: 510000 },
        { id: 'usr_10', name: 'Đặng Thanh Thảo', email: 'thao.dang@gmail.com', phone: '0912345610', orderCount: 1, delivering: 0, total: 95000 },
        { id: 'usr_11', name: 'Dương Quang Huy', email: 'huy.duong@gmail.com', phone: '0912345611', orderCount: 4, delivering: 2, total: 720000 },
        { id: 'usr_12', name: 'Phan Kim Ngân', email: 'ngan.phan@gmail.com', phone: '0912345612', orderCount: 2, delivering: 0, total: 290000 },
        { id: 'usr_13', name: 'Lý Gia Hưng', email: 'hung.ly@gmail.com', phone: '0912345613', orderCount: 0, delivering: 0, total: 0 },
        { id: 'usr_14', name: 'Trịnh Ngọc Ánh', email: 'anh.trinh@gmail.com', phone: '0912345614', orderCount: 3, delivering: 1, total: 480000 },
        { id: 'usr_15', name: 'Võ Minh Khôi', email: 'khoi.vo@gmail.com', phone: '0912345615', orderCount: 5, delivering: 0, total: 930000 },
        { id: 'usr_16', name: 'Hồ Quỳnh Chi', email: 'chi.ho@gmail.com', phone: '0912345616', orderCount: 1, delivering: 1, total: 190000 },
        { id: 'usr_17', name: 'Đinh Trọng Nghĩa', email: 'nghia.dinh@gmail.com', phone: '0912345617', orderCount: 2, delivering: 0, total: 310000 },
        { id: 'usr_18', name: 'Mai Tuyết Nhung', email: 'nhung.mai@gmail.com', phone: '0912345618', orderCount: 4, delivering: 1, total: 680000 },
        { id: 'usr_19', name: 'Lương Hoài Nam', email: 'nam.luong@gmail.com', phone: '0912345619', orderCount: 0, delivering: 0, total: 0 },
        { id: 'usr_20', name: 'Tạ Văn Quyết', email: 'quyet.ta@gmail.com', phone: '0912345620', orderCount: 3, delivering: 1, total: 540000 },
        { id: 'usr_21', name: 'Cao Diệp Linh', email: 'linh.cao@gmail.com', phone: '0912345621', orderCount: 2, delivering: 0, total: 260000 },
        { id: 'usr_22', name: 'Trương Tuấn Kiệt', email: 'kiet.truong@gmail.com', phone: '0912345622', orderCount: 1, delivering: 1, total: 175000 }
      ];

      for (const u of SAMPLE_CUSTOMERS) {
        await env.DB.prepare(
          `INSERT OR IGNORE INTO users (id, name, email, password_hash, phone, role) VALUES (?, ?, ?, 'dummy_hash', ?, 'user')`
        ).bind(u.id, u.name, u.email, u.phone).run();

        if (u.orderCount > 0) {
          for (let i = 1; i <= u.orderCount; i++) {
            const isDelivering = i <= u.delivering;
            const status = isDelivering ? 'confirmed' : 'delivered';
            const ordId = `ORD_${u.id}_${i}`;
            const singleTotal = Math.round(u.total / u.orderCount);
            await env.DB.prepare(
              `INSERT OR IGNORE INTO orders (id, user_id, customer_name, customer_phone, customer_email, customer_address, items, subtotal, shipping, total, status, created_at)
               VALUES (?, ?, ?, ?, ?, '123 Đường Sữa Hạt, Q.1, TP.HCM', '[{"name":"Sữa Hạt Dana","qty":2,"price":85000}]', ?, 20000, ?, ?, datetime('now', ?))`
            ).bind(ordId, u.id, u.name, u.phone, u.email, singleTotal - 20000, singleTotal, status, `-${i * 3} days`).run();
          }
        }
      }
    }

  } catch(e) {
    console.error('Migration error:', e);
  }
}

let migrated = false;

export default {
  async fetch(request, env, ctx) {
    // Run migrations once per worker lifecycle
    if (!migrated) {
      await runMigrations(env);
      migrated = true;
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Serve R2 images via /cdn/*
    if (path.startsWith('/cdn/')) {
      const key = path.replace('/cdn/', '');
      try {
        const object = await env.IMAGES.get(key);
        if (!object) {
          return new Response('Not Found', { status: 404 });
        }
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('Cache-Control', 'public, max-age=31536000');
        for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
        return new Response(object.body, { headers });
      } catch(e) {
        return new Response('Error loading image', { status: 500 });
      }
    }

    // Only handle /api/* routes - let assets handle the rest
    if (!path.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    // Build context compatible with Pages Functions signature
    const context = { request, env, params: {} };
    let response;

    try {
      switch (path) {
        case '/api/auth':
          if (method === 'POST') response = await authPost(context);
          break;

        case '/api/cart':
          if (method === 'GET') response = await cartGet(context);
          else if (method === 'POST') response = await cartPost(context);
          break;

        case '/api/products':
          if (method === 'GET') response = await productsGet(context);
          break;

        case '/api/orders':
          if (method === 'GET') response = await ordersGet(context);
          else if (method === 'POST') response = await ordersPost(context);
          else if (method === 'PUT') response = await ordersPut(context);
          break;

        case '/api/contact':
          if (method === 'POST') response = await contactPost(context);
          break;

        case '/api/upload':
          if (method === 'POST') response = await uploadPost(context);
          break;

        case '/api/admin/dashboard':
          if (method === 'GET') response = await dashboardGet(context);
          else if (method === 'POST') response = await dashboardPost(context);
          break;

        case '/api/blogs':
          if (method === 'GET') response = await blogsGet(context);
          else if (method === 'POST') response = await blogsPost(context);
          break;
      }
    } catch (err) {
      response = new Response(JSON.stringify({ ok: false, message: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!response) {
      response = new Response(JSON.stringify({ ok: false, message: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return corsResponse(response);
  },
};

