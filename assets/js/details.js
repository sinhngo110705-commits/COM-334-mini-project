import { LOGO } from './site-content.js';
import { renderBlogContent } from './blog-content.js';

function useImageFallback(root) {
  root.querySelectorAll('img').forEach(img => {
    const fallback = () => { img.src = LOGO; };
    img.addEventListener('error', fallback, { once: true });
    if (img.complete && !img.naturalWidth) fallback();
  });
}

document.getElementById('share-detail')?.addEventListener('click', async () => {
  const url = document.querySelector('link[rel="canonical"]').href;
  const status = document.getElementById('share-status');
  try {
    if (navigator.share) {
      await navigator.share({ title: document.title, url });
      return;
    }
  } catch (error) {
    if (error.name === 'AbortError') return;
  }
  try {
    await navigator.clipboard.writeText(url);
    status.textContent = 'Đã sao chép liên kết.';
  } catch {
    const input = document.createElement('input');
    input.className = 'form-control';
    input.readOnly = true;
    input.value = url;
    input.setAttribute('aria-label', 'Liên kết để chia sẻ');
    status.replaceChildren(input);
    input.select();
  }
});

const productData = document.getElementById('product-data');
if (productData) {
  const product = JSON.parse(productData.textContent);
  document.getElementById('add-detail-to-cart').addEventListener('click', () => {
    Cart.addItem(product);
  });
}

const articleData = document.getElementById('article-data');
if (articleData) {
  const article = JSON.parse(articleData.textContent);
  document.getElementById('article-body').replaceChildren(renderBlogContent(article.content, { cover: article.cover }));
  setupComments(article.id);
  blogAction({ action: 'view', blogId: article.id }).then(data => {
    if (data.ok) document.getElementById('article-views').textContent = `${data.views} lượt xem`;
  }).catch(() => {});
}
useImageFallback(document.querySelector('main'));

function blogAction(body) {
  return fetch('/api/blogs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(response => response.json());
}

async function setupComments(blogId) {
  const form = document.getElementById('article-comment-form');
  const list = document.getElementById('article-comment-list');
  const status = document.getElementById('comment-status');
  const count = document.getElementById('comment-count');
  const user = typeof Auth === 'undefined' ? null : Auth.getCurrentUser();
  form.elements.name.value = user?.name || '';
  form.elements.email.value = user?.email || '';
  let comments = [];

  function renderComments() {
    count.textContent = `(${comments.length})`;
    if (!comments.length) {
      list.textContent = 'Chưa có bình luận.';
      return;
    }
    list.replaceChildren(...comments.map(comment => {
      const entry = document.createElement('article');
      entry.className = 'comment-entry';
      const name = document.createElement('strong');
      name.textContent = comment.user_name;
      const date = document.createElement('time');
      date.textContent = new Date(comment.created_at.replace(' ', 'T') + 'Z').toLocaleDateString('vi-VN');
      const text = document.createElement('p');
      text.textContent = comment.content;
      entry.append(name, date, text);
      return entry;
    }));
  }

  const commentRequest = fetch(`/api/blogs?action=comments&blogId=${encodeURIComponent(blogId)}`)
    .then(response => response.json())
    .then(data => {
      if (!data.ok) throw new Error('Could not load comments');
      comments = data.comments;
      renderComments();
    }).catch(() => { list.textContent = 'Không thể tải bình luận.'; });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button');
    button.disabled = true;
    try {
      const data = await blogAction({ action: 'comment', blogId, ...Object.fromEntries(new FormData(form)) });
      if (!data.ok) throw new Error(data.message);
      await commentRequest;
      if (!comments.some(comment => comment.id === data.comment.id)) comments.push(data.comment);
      renderComments();
      form.elements.content.value = '';
      status.textContent = 'Đã gửi bình luận.';
    } catch (error) {
      status.textContent = error.message || 'Không thể gửi bình luận. Vui lòng thử lại.';
    } finally {
      button.disabled = false;
    }
  });
}
