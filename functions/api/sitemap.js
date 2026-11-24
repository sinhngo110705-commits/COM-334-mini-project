import { detailPath } from '../../assets/js/site-content.js';

/* ===================================================
   API: /sitemap.xml & /api/sitemap
   Dynamic XML Sitemap Generator for SEO
   =================================================== */

// Baseline fallbacks in case D1 is empty or offline
const FALLBACK_PRODUCTS = [
  { id: 'sp001', created_at: '2026-11-02' },
  { id: 'sp002', created_at: '2026-11-02' },
  { id: 'sp003', created_at: '2026-11-02' },
  { id: 'sp004', created_at: '2026-11-02' },
  { id: 'sp005', created_at: '2026-11-02' },
  { id: 'sp_combo01', created_at: '2026-11-02' }
];

const FALLBACK_BLOGS = [
  { id: 'blg_cong_thuc_1', created_at: '2026-10-28' },
  { id: 'blg_fitness_1', created_at: '2026-10-26' },
  { id: 'blg_dinh_duong_1', created_at: '2026-10-24' },
  { id: 'blg_gia_dinh_1', created_at: '2026-10-23' },
  { id: 'blg_dinh_duong_2', created_at: '2026-10-20' },
  { id: 'blg_cong_thuc_2', created_at: '2026-10-05' }
];

export function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;');
}

export function formatDate(dateVal) {
  if (!dateVal) return new Date().toISOString().split('T')[0];
  try {
    const str = String(dateVal).trim();
    const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];

    const d = new Date(str.replace(' ', 'T'));
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

export function getBaseUrl(request) {
  if (!request) return 'https://hnguyenworks.id.vn';
  try {
    const url = new URL(request.url);
    const rawProto = (request.headers && request.headers.get('x-forwarded-proto')) || (url.protocol ? url.protocol.replace(':', '') : 'https') || 'https';
    const proto = rawProto.split(',')[0].trim();
    const rawHost = (request.headers && (request.headers.get('x-forwarded-host') || request.headers.get('host'))) || url.host || 'hnguyenworks.id.vn';
    const host = rawHost.split(',')[0].trim();
    return `${proto}://${host}`;
  } catch (e) {
    return 'https://hnguyenworks.id.vn';
  }
}

export function generateRobotsTxt(request) {
  const baseUrl = getBaseUrl(request);
  const content = `User-agent: *
Allow: /
Disallow: /admin.html
Disallow: /admin/
Disallow: /admin
Disallow: /account.html
Disallow: /account/
Disallow: /account
Disallow: /api/admin/
Disallow: /api/admin

Sitemap: ${baseUrl}/sitemap.xml
`;
  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function generateSitemapXml(context) {
  const { env, request } = context;
  const baseUrl = getBaseUrl(request);
  const today = new Date().toISOString().split('T')[0];

  // Static landing pages configuration
  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'daily', lastmod: today },
    { path: '/products.html', priority: '0.9', changefreq: 'daily', lastmod: today },
    { path: '/blog.html', priority: '0.9', changefreq: 'daily', lastmod: today },
    { path: '/about.html', priority: '0.8', changefreq: 'monthly', lastmod: '2026-04-17' },
    { path: '/contact.html', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-17' },
    { path: '/cart.html', priority: '0.5', changefreq: 'monthly', lastmod: '2026-04-17' },
    { path: '/privacy.html', priority: '0.3', changefreq: 'yearly', lastmod: '2026-04-17' },
    { path: '/terms.html', priority: '0.3', changefreq: 'yearly', lastmod: '2026-04-17' }
  ];

  let products = FALLBACK_PRODUCTS;
  let blogs = FALLBACK_BLOGS;

  if (env && env.DB) {
    try {
      const pRes = await env.DB.prepare(
        'SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC'
      ).all();
      products = pRes.results;
    } catch (e) {
      console.error('Error fetching products for sitemap:', e);
    }

    try {
      const bRes = await env.DB.prepare(
        'SELECT * FROM blogs WHERE is_active = 1 ORDER BY created_at DESC'
      ).all();
      blogs = bRes.results;
    } catch (e) {
      console.error('Error fetching blogs for sitemap:', e);
    }
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Static pages
  for (const p of staticPages) {
    const loc = `${baseUrl}${p.path}`;
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${p.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
    xml += `    <priority>${p.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  // Dynamic product pages
  for (const prod of products) {
    const loc = baseUrl + detailPath('products', prod.id);
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${formatDate(prod.created_at)}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  }

  // Dynamic blog articles
  for (const b of blogs) {
    const loc = baseUrl + detailPath('blog', b.id);
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${formatDate(b.created_at)}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function onRequestGet(context) {
  return generateSitemapXml(context);
}
