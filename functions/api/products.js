/* ===================================================
   API: /api/products - Product CRUD
   =================================================== */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// GET /api/products?category=xxx
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  try {
    let query = 'SELECT * FROM products WHERE is_active = 1';
    const bindings = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      bindings.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = bindings.length > 0
      ? env.DB.prepare(query).bind(...bindings)
      : env.DB.prepare(query);

    const { results } = await stmt.all();

    // Parse tags JSON string for each product
    const products = results.map(p => ({
      ...p,
      tags: p.tags ? JSON.parse(p.tags) : []
    }));

    return json({ ok: true, products });
  } catch (err) {
    return json({ ok: false, message: err.message }, 500);
  }
}
