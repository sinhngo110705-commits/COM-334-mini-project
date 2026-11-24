import { detailPath, escapeHtml, imageUrl, LOGO } from './site-content.js';

const grid = document.getElementById('product-grid') || document.getElementById('featured-products-grid');
const featured = grid?.id === 'featured-products-grid';
const tabs = document.querySelectorAll('.filter-tab[data-filter]');
tabs.forEach(tab => { tab.dataset.filterManaged = ''; });
const formatPrice = price => `${Number(price).toLocaleString('vi-VN')}đ`;
let requestNumber = 0;
let products = new Map();

const legacyId = !featured && location.hash.length > 1 ? location.hash.slice(1) : '';
if (legacyId) {
  try {
    location.replace(detailPath('products', decodeURIComponent(legacyId)));
  } catch {
    location.replace('/products.html');
  }
} else if (grid) {
  loadProducts();
}

function card(product) {
  const name = escapeHtml(product.name);
  const url = detailPath('products', product.id);
  const tags = (product.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  return `
    <article class="product-card tilt-card" style="animation:scaleIn .4s ease forwards">
      <a href="${url}" class="product-card-img" aria-label="${name}">
        ${product.badge ? `<span class="product-card-badge">${escapeHtml(product.badge)}</span>` : ''}
        <img src="${escapeHtml(imageUrl(product.image_url))}" alt="${name}" loading="lazy" />
      </a>
      <div class="product-card-body">
        ${tags ? `<div class="product-card-tags">${tags}</div>` : ''}
        <h4><a href="${url}" class="product-card-title">${name}</a></h4>
        <p>${escapeHtml(product.description)}</p>
        <div class="product-card-footer">
          <div><span class="price">${formatPrice(product.price)}</span>
            ${product.original_price ? `<span class="price-old">${formatPrice(product.original_price)}</span>` : ''}
          </div>
          <button type="button" class="add-btn" data-product-id="${escapeHtml(product.id)}" aria-label="Thêm ${name} vào giỏ hàng">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
    </article>`;
}

async function loadProducts(category = 'all') {
  const currentRequest = ++requestNumber;
  grid.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch(`/api/products?category=${encodeURIComponent(category)}`);
    const data = await response.json();
    if (currentRequest !== requestNumber) return;
    if (!data.ok) throw new Error('Could not load products');
    const visible = featured ? data.products.slice(0, 6) : data.products;
    products = new Map(visible.map(product => [product.id, product]));
    grid.innerHTML = visible.length ? visible.map(card).join('') : '<p>Không tìm thấy sản phẩm nào.</p>';
    grid.querySelectorAll('img').forEach(img => {
      const fallback = () => { img.src = LOGO; };
      img.addEventListener('error', fallback, { once: true });
      if (img.complete && !img.naturalWidth) fallback();
    });
  } catch {
    if (currentRequest === requestNumber) grid.textContent = 'Lỗi tải dữ liệu. Vui lòng thử lại.';
  } finally {
    if (currentRequest === requestNumber) grid.removeAttribute('aria-busy');
  }
}

tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(item => item.classList.toggle('active', item === tab));
  loadProducts(tab.dataset.filter);
}));

grid?.addEventListener('click', event => {
  const button = event.target.closest('button[data-product-id]');
  if (!button) return;
  const product = products.get(button.dataset.productId);
  if (!product) return;
  Cart.addItem({
    id: product.id, name: product.name, price: product.price, image: imageUrl(product.image_url),
    variant: 'Mặc định', qty: 1
  });
});
