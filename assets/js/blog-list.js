import { blogExcerpt, detailPath, escapeHtml, imageUrl, LOGO } from './site-content.js';

const FEATURED = document.getElementById('featured-blog-container');
const grid = document.getElementById('blog-grid') || document.getElementById('home-blog-grid');
const listing = Boolean(FEATURED);
const tabs = document.querySelectorAll('.filter-tab[data-filter]');
tabs.forEach(tab => { tab.dataset.filterManaged = ''; });

const legacyId = listing && location.hash.length > 1 ? location.hash.slice(1) : '';
if (legacyId) {
  try {
    location.replace(detailPath('blog', decodeURIComponent(legacyId)));
  } catch {
    location.replace('/blog.html');
  }
} else if (grid) {
  loadBlogs();
}

function blogCard(blog, featured = false) {
  const title = escapeHtml(blog.title);
  const category = (blog.category || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/\s+/g, '-');
  const date = (blog.created_at || '').split(/\D/).slice(0, 3).reverse().join('/');
  return `
    <a href="${detailPath('blog', blog.id)}" class="blog-card${featured ? ' blog-featured' : ''}" data-category="${escapeHtml(category)}">
      <div class="blog-card-img">
        <img src="${escapeHtml(imageUrl(blog.image_url))}" alt="${title}" loading="lazy" />
        <span class="blog-card-cat">${escapeHtml(blog.category || 'Blog')}</span>
      </div>
      <div class="blog-card-body">
        <p class="blog-meta">${escapeHtml(date)} · ${blog.views || 0} lượt xem · ${blog.comment_count || 0} bình luận</p>
        <h4>${title}</h4>
        <p>${escapeHtml(blogExcerpt(blog.content, featured ? 160 : 100))}</p>
        <span class="read-more">Đọc bài viết →</span>
      </div>
    </a>`;
}

async function loadBlogs() {
  try {
    const response = await fetch('/api/blogs');
    const data = await response.json();
    if (!data.ok) throw new Error('Could not load blog');
    if (!data.blogs.length) {
      grid.textContent = 'Hiện chưa có bài viết nào.';
      return;
    }
    if (listing) FEATURED.innerHTML = blogCard(data.blogs[0], true);
    grid.innerHTML = (listing ? data.blogs.slice(1) : data.blogs.slice(0, 3)).map(blog => blogCard(blog)).join('');
    document.querySelectorAll('.blog-card img').forEach(img => {
      const fallback = () => { img.src = LOGO; };
      img.addEventListener('error', fallback, { once: true });
      if (img.complete && !img.naturalWidth) fallback();
    });

    tabs.forEach(tab => tab.addEventListener('click', () => {
      tabs.forEach(item => item.classList.toggle('active', item === tab));
      document.querySelectorAll('.blog-card').forEach(card => {
        card.hidden = tab.dataset.filter !== 'all' && card.dataset.category !== tab.dataset.filter;
      });
    }));
  } catch {
    grid.textContent = 'Không thể tải bài viết. Vui lòng thử lại sau.';
  }
}
