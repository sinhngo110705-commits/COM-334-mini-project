import { getPublicBlog } from '../functions/blog-record.js';
import { blogExcerpt, detailPath, escapeHtml, imageUrl, safeUrl } from '../assets/js/site-content.js';
import { PRODUCT_STORIES } from './product-stories.js';

const price = value => `${Number(value).toLocaleString('vi-VN')}đ`;

function shareButton() {
  return `<button type="button" class="btn btn-outline" id="share-detail">Chia sẻ</button>
    <span class="share-status" id="share-status" role="status"></span>`;
}

function renderBlog(blog, origin, image) {
  const date = (blog.created_at || '').split(/\D/).slice(0, 3).reverse().join('/');
  const payload = JSON.stringify({ id: blog.id, content: blog.content, cover: safeUrl(blog.image_url, origin) })
    .replace(/</g, '\\u003c');
  return `
    <article class="blog-post">
      <a class="detail-back" href="/blog.html">← Tất cả bài viết</a>
      <div class="article-meta">
        <span>${escapeHtml(blog.category || 'Blog')}</span>
        <span>${escapeHtml(date)}</span>
        <span id="article-views">${blog.views} lượt xem</span>
      </div>
      <h1>${escapeHtml(blog.title)}</h1>
      <div class="detail-actions">${shareButton()}</div>
      ${blog.image_url ? `<img class="article-cover" src="${escapeHtml(image)}" alt="${escapeHtml(blog.title)}" data-image-fallback />` : ''}
      <div id="article-body" class="article-body"></div>
      <script type="application/json" id="article-data">${payload}</script>
      <noscript>Bật JavaScript để đọc toàn bộ bài viết và bình luận.</noscript>
      <section class="article-comments" aria-labelledby="comments-heading">
        <h2 id="comments-heading">Bình luận <span id="comment-count">(${blog.comment_count})</span></h2>
        <form id="article-comment-form">
          <div class="comment-fields">
            <label>Họ và tên <input name="name" class="form-control" minlength="2" maxlength="100" required /></label>
            <label>Email (không công khai) <input name="email" type="email" class="form-control" maxlength="254" /></label>
          </div>
          <label>Bình luận <textarea name="content" class="form-control" rows="3" minlength="2" maxlength="2000" required></textarea></label>
          <button class="btn btn-primary" type="submit">Gửi bình luận</button>
          <p role="status" id="comment-status"></p>
        </form>
        <div id="article-comment-list" aria-live="polite">Đang tải bình luận…</div>
      </section>
    </article>`;
}

function renderProduct(product, image) {
  const story = Object.hasOwn(PRODUCT_STORIES, product.id) ? PRODUCT_STORIES[product.id] : null;
  const payload = JSON.stringify({
    id: product.id, name: product.name, price: product.price, image, variant: 'Mặc định', qty: 1
  }).replace(/</g, '\\u003c');
  return `
    <a class="detail-back" href="/products.html">← Tất cả sản phẩm</a>
    <div class="product-detail-layout product-page">
      <div class="product-gallery-main">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" data-image-fallback />
      </div>
      <section class="product-detail-info">
        ${product.badge ? `<span class="tag">${escapeHtml(product.badge)}</span>` : ''}
        <h1>${escapeHtml(product.name)}</h1>
        <div class="price-block"><span class="price">${price(product.price)}</span>
          ${product.original_price ? `<span class="price-old">${price(product.original_price)}</span>` : ''}
        </div>
        ${product.description ? `<p class="product-description">${escapeHtml(product.description)}</p>` : ''}
        ${story ? `<div class="product-story">
          <h2>${escapeHtml(story.feature)}</h2>
          <p>${escapeHtml(story.description)}</p>
          <ul class="product-card-tags">${story.benefits.map(benefit => `<li class="tag">${escapeHtml(benefit)}</li>`).join('')}</ul>
        </div>` : ''}
        <div class="detail-actions"><button id="add-detail-to-cart" type="button" class="btn btn-primary">Thêm vào giỏ hàng</button>${shareButton()}</div>
      </section>
    </div>
    <script type="application/json" id="product-data">${payload}</script>`;
}

function metadata({ title, description, canonical, image, type }) {
  const pageTitle = `${title} | Sữa Hạt Dana`;
  return `<title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />`;
}

export async function serveDetail(request, env, section, id) {
  const origin = new URL(request.url).origin;
  const isBlog = section === 'blog';
  const record = !id ? null : isBlog
    ? await getPublicBlog(env.DB, id)
    : await env.DB.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').bind(id).first();
  const asset = await env.ASSETS.fetch(new URL('/detail', origin));
  if (!asset.ok) throw new Error('Missing detail page template');

  const template = await asset.text();
  const label = isBlog ? 'Bài viết' : 'Sản phẩm';
  const listing = isBlog ? '/blog.html' : '/products.html';
  const head = record ? metadata({
    title: isBlog ? record.title : record.name,
    description: blogExcerpt(isBlog ? record.content : record.description) || 'Sữa Hạt Dana',
    canonical: origin + detailPath(section, record.id),
    image: new URL(imageUrl(record.image_url, origin), origin).href,
    type: isBlog ? 'article' : 'product'
  }) : `<title>${label} không tồn tại | Sữa Hạt Dana</title><meta name="robots" content="noindex" />`;
  let body;
  if (record) {
    const image = imageUrl(record.image_url, origin);
    body = isBlog ? renderBlog(record, origin, image) : renderProduct(record, image);
  } else {
    body = `<h1>${label} không tồn tại</h1><p><a class="detail-back" href="${listing}">← Quay lại danh sách</a></p>`;
  }
  const html = template.replace('<!-- detail-metadata -->', () => head)
    .replace('<!-- detail-content -->', () => body);
  return new Response(request.method === 'HEAD' ? null : html, {
    status: record ? 200 : 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }
  });
}
