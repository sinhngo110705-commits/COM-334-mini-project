const LEGACY_IDS = new Set([
  'blg_dinh_duong_1', 'blg_dinh_duong_2', 'blg_cong_thuc_1',
  'blg_cong_thuc_2', 'blg_fitness_1', 'blg_gia_dinh_1'
]);
const WINDOWS_1252 = '€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008dŽ\u008f\u0090‘’“”•–—˜™š›œ\u009džŸ';
const utf8 = new TextDecoder('utf-8', { fatal: true });

export function recoverSeedText(value) {
  if (!value || !/[ÃÂÄÆáâð]/.test(value)) return value;
  const bytes = [];
  for (const char of value) {
    const special = WINDOWS_1252.indexOf(char);
    const code = special < 0 ? char.codePointAt(0) : special + 128;
    if (code > 255) return value;
    bytes.push(code);
  }
  try {
    return utf8.decode(Uint8Array.from(bytes));
  } catch {
    return value;
  }
}

export function normalizeBlog(blog) {
  if (!blog || !LEGACY_IDS.has(blog.id)) return blog;
  return {
    ...blog,
    title: recoverSeedText(blog.title),
    category: recoverSeedText(blog.category),
    content: recoverSeedText(blog.content)
  };
}

export async function getPublicBlog(db, id) {
  const blog = await db.prepare(
    `SELECT b.id, b.title, b.category, b.content, b.image_url, COALESCE(b.views, 0) AS views, b.created_at,
      (SELECT COUNT(*) FROM blog_comments WHERE blog_id = b.id) AS comment_count
     FROM blogs b WHERE b.id = ? AND b.is_active = 1`
  ).bind(id).first();
  return normalizeBlog(blog);
}
