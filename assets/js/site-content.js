export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

export function detailPath(section, id) {
  return `/${section}/${encodeURIComponent(id)}`;
}

export function safeUrl(value, origin) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value.trim(), `${origin}/`);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

export const LOGO = '/assets/images/logo.jpeg';

export function imageUrl(value, origin = location.origin) {
  return safeUrl(value, origin) || LOGO;
}

export function blogExcerpt(content, length = 150) {
  const words = (content || '').replace(/<[^>]*>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|lt|gt|#39);/g, entity => ({
      '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&lt;': '<', '&gt;': '>', '&#39;': "'"
    })[entity]).replace(/\s+/g, ' ').trim();
  return words.length > length ? `${words.slice(0, length).trimEnd()}…` : words;
}
