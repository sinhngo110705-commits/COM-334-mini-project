/* ===================================================
   API: /api/blogs - Blog Public API
   =================================================== */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// GET /api/blogs - Get active blogs
export async function onRequestGet(context) {
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(
      'SELECT id, title, category, content, image_url, created_at FROM blogs WHERE is_active = 1 ORDER BY created_at DESC'
    ).all();

    return json({ ok: true, blogs: results });
  } catch (err) {
    return json({ ok: false, message: err.message }, 500);
  }
}
