/* ===================================================
   API: /api/contact - Contact Form Submissions
   =================================================== */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// POST /api/contact - Submit contact form
export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return json({ ok: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' }, 400);
    }

    await env.DB.prepare(
      'INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)'
    ).bind(name, email, phone || '', subject || '', message).run();

    return json({ ok: true, message: 'Cảm ơn bạn! Chúng tôi sẽ phản hồi trong 24 giờ.' });
  } catch (err) {
    return json({ ok: false, message: err.message }, 500);
  }
}
