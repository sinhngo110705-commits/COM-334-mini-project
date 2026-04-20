/* ===================================================
   SỮAHẠT DANA - Cart System (localStorage)
   Ready to migrate to Cloud API
   =================================================== */

const Cart = (() => {
  const STORAGE_KEY = 'dana_cart';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  async function syncCartToServer(cart) {
    const token = localStorage.getItem('dana_auth_token');
    if (!token) return;
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, cart })
      });
    } catch {}
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
    dispatchCartEvent(cart);
    syncCartToServer(cart);
  }

  function dispatchCartEvent(cart) {
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
  }

  async function loadCartFromServer() {
    const token = localStorage.getItem('dana_auth_token');
    if (!token) return;
    try {
      const res = await fetch(`/api/cart?token=${token}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.cart)) {
        // Merge local data with server data, prioritizing server data
        // For simplicity, overwrite local if server has items
        if (data.cart.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.cart));
          updateCartBadge();
          renderCartPage && renderCartPage();
        } else {
          // If server is empty but local has items, sync local to server
          const localCart = getCart();
          if (localCart.length > 0) syncCartToServer(localCart);
        }
      }
    } catch {}
  }

  // Auto load from server if logged in
  document.addEventListener('DOMContentLoaded', loadCartFromServer);

  function updateCartBadge() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = total;
      badge.classList.toggle('show', total > 0);
    });
  }

  function addItem(product) {
    const cart = getCart();
    const existing = cart.find(i => i.id === product.id && i.variant === product.variant);
    if (existing) {
      existing.qty += product.qty || 1;
    } else {
      cart.push({
        id:      product.id,
        name:    product.name,
        price:   product.price,
        image:   product.image,
        variant: product.variant || 'Mặc định',
        qty:     product.qty || 1
      });
    }
    saveCart(cart);
    window.showToast?.(`Đã thêm <strong>${product.name}</strong> vào giỏ! 🛒`, '🌿');
    return cart;
  }

  function removeItem(id, variant = 'Mặc định') {
    const cart = getCart().filter(i => !(i.id === id && i.variant === variant));
    saveCart(cart);
    return cart;
  }

  function updateQty(id, variant, qty) {
    const cart = getCart();
    const item = cart.find(i => i.id === id && i.variant === variant);
    if (item) {
      if (qty <= 0) return removeItem(id, variant);
      item.qty = qty;
      saveCart(cart);
    }
    return cart;
  }

  function clearCart() { saveCart([]); }

  function getTotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function getCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
  }

  return { getCart, addItem, removeItem, updateQty, clearCart, getTotal, getCount, updateCartBadge };
})();

// =================== CART PAGE RENDERER ===================
function renderCartPage() {
  const list    = document.getElementById('cart-list');
  const empty   = document.getElementById('cart-empty');
  const summary = document.getElementById('cart-summary');
  if (!list) return;

  const cart = Cart.getCart();

  if (cart.length === 0) {
    list.innerHTML = '';
    empty?.classList.remove('hidden');
    summary?.classList.add('hidden');
    return;
  }

  empty?.classList.add('hidden');
  summary?.classList.remove('hidden');

  list.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}" data-variant="${item.variant}">
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-variant">${item.variant}</div>
      </div>
      <div class="cart-qty">
        <button class="cart-qty-btn" onclick="changeQty('${item.id}','${item.variant}',-1)">−</button>
        <span class="cart-qty-num">${item.qty}</span>
        <button class="cart-qty-btn" onclick="changeQty('${item.id}','${item.variant}',1)">+</button>
      </div>
      <div class="cart-item-price">${(item.price * item.qty).toLocaleString('vi-VN')}đ</div>
      <button class="cart-item-remove" onclick="removeCartItem('${item.id}','${item.variant}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>
    </div>
  `).join('');

  // Summary
  const subtotal  = Cart.getTotal();
  const shipping  = subtotal >= 500000 ? 0 : 30000;
  const total     = subtotal + shipping;
  document.getElementById('subtotal-val')  && (document.getElementById('subtotal-val').textContent  = subtotal.toLocaleString('vi-VN') + 'đ');
  document.getElementById('shipping-val')  && (document.getElementById('shipping-val').textContent  = shipping === 0 ? 'Miễn phí' : shipping.toLocaleString('vi-VN') + 'đ');
  document.getElementById('total-val')     && (document.getElementById('total-val').textContent     = total.toLocaleString('vi-VN') + 'đ');
}

function changeQty(id, variant, delta) {
  const cart = Cart.getCart();
  const item = cart.find(i => i.id === id && i.variant === variant);
  if (item) Cart.updateQty(id, variant, item.qty + delta);
  renderCartPage();
}
function removeCartItem(id, variant) {
  Cart.removeItem(id, variant);
  renderCartPage();
  window.showToast?.('Đã xóa sản phẩm khỏi giỏ hàng', '🗑️');
}

// Add to cart buttons (product listing)
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateCartBadge();
  renderCartPage();

  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      Cart.addItem({
        id:    btn.dataset.id,
        name:  btn.dataset.name,
        price: parseInt(btn.dataset.price),
        image: btn.dataset.image || 'assets/images/products/almond.png',
        variant: btn.dataset.variant || 'Mặc định',
        qty: 1
      });
    });
  });
});
