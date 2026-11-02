/* ===================================================
   API: /api/blogs - Blog Public API
   Supports: Active blogs listing, view count increment,
             comments retrieval and submission.
   =================================================== */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// GET /api/blogs - Get active blogs or comments for a blog
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const blogId = url.searchParams.get('blogId') || url.searchParams.get('id');

  try {
    // 1. Fetch comments for a specific blog
    if (action === 'comments' && blogId) {
      const { results } = await env.DB.prepare(
        'SELECT id, blog_id, user_name, user_email, content, created_at FROM blog_comments WHERE blog_id = ? ORDER BY created_at ASC'
      ).bind(blogId).all();
      return json({ ok: true, comments: results });
    }

    // 2. Fetch single blog with comments & views
    if (blogId) {
      const blog = await env.DB.prepare(
        `SELECT b.id, b.title, b.category, b.content, b.image_url, COALESCE(b.views, 0) as views, b.created_at,
         (SELECT COUNT(*) FROM blog_comments WHERE blog_id = b.id) as comment_count
         FROM blogs b WHERE b.id = ? AND b.is_active = 1`
      ).bind(blogId).first();

      if (!blog) return json({ ok: false, message: 'Bài viết không tồn tại.' }, 404);

      const { results: comments } = await env.DB.prepare(
        'SELECT id, blog_id, user_name, user_email, content, created_at FROM blog_comments WHERE blog_id = ? ORDER BY created_at ASC'
      ).bind(blogId).all();

      return json({ ok: true, blog, comments });
    }

    // 3. List all active blogs with view count and comment count
    const { results } = await env.DB.prepare(
      `SELECT b.id, b.title, b.category, b.content, b.image_url, COALESCE(b.views, 0) as views, b.created_at,
       (SELECT COUNT(*) FROM blog_comments WHERE blog_id = b.id) as comment_count
       FROM blogs b WHERE b.is_active = 1 ORDER BY b.created_at DESC`
    ).all();

    return json({ ok: true, blogs: results });
  } catch (err) {
    return json({ ok: false, message: err.message }, 500);
  }
}

// POST /api/blogs - Record view or submit new comment
export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    const body = await request.json();
    const action = body.action;

    // View increment
    if (action === 'view') {
      const { blogId } = body;
      if (!blogId) return json({ ok: false, message: 'Thiếu blogId.' }, 400);

      const exists = await env.DB.prepare('SELECT id FROM blogs WHERE id = ?').bind(blogId).first();
      if (!exists) return json({ ok: false, message: 'Bài viết không tồn tại.' }, 404);

      await env.DB.prepare(
        'UPDATE blogs SET views = COALESCE(views, 0) + 1 WHERE id = ?'
      ).bind(blogId).run();

      const updated = await env.DB.prepare('SELECT COALESCE(views, 0) as views FROM blogs WHERE id = ?').bind(blogId).first();
      return json({ ok: true, views: updated ? updated.views : 0 });
    }

    // Add comment
    if (action === 'comment') {
      const { blogId, name, email, content } = body;
      if (!blogId || !name || !content) {
        return json({ ok: false, message: 'Vui lòng nhập họ tên và nội dung bình luận.' }, 400);
      }
      if (name.trim().length < 2) {
        return json({ ok: false, message: 'Họ tên quá ngắn.' }, 400);
      }
      if (content.trim().length < 2) {
        return json({ ok: false, message: 'Nội dung bình luận quá ngắn.' }, 400);
      }

      // Check if blog exists
      const blog = await env.DB.prepare('SELECT id FROM blogs WHERE id = ?').bind(blogId).first();
      if (!blog) {
        return json({ ok: false, message: 'Bài viết không tồn tại.' }, 404);
      }

      const res = await env.DB.prepare(
        'INSERT INTO blog_comments (blog_id, user_name, user_email, content) VALUES (?, ?, ?, ?)'
      ).bind(blogId, name.trim(), (email || '').trim(), content.trim()).run();

      const newComment = await env.DB.prepare(
        'SELECT id, blog_id, user_name, user_email, content, created_at FROM blog_comments WHERE id = ?'
      ).bind(res.meta.last_row_id).first();

      return json({ ok: true, comment: newComment });
    }

    return json({ ok: false, message: 'Action không hợp lệ.' }, 400);
  } catch (err) {
    return json({ ok: false, message: err.message }, 500);
  }
}

