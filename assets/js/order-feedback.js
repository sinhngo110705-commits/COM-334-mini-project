const OrderFeedback = (() => {
  const storageKey = 'dana_order_receipt';

  function readReceipt() {
    try { return JSON.parse(sessionStorage.getItem(storageKey)); } catch { return null; }
  }

  function saveReceipt(receipt) {
    try { sessionStorage.setItem(storageKey, JSON.stringify(receipt)); } catch {}
  }

  function showSubmitted(container, rating, message = 'Bạn đã gửi phản hồi.') {
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.textContent = rating ? `${message} Điểm của bạn: ${rating}/5 sao.` : message;
    container.replaceChildren(status);
  }

  function mount(container, { orderId, feedbackToken }) {
    const form = document.createElement('form');
    form.className = 'order-feedback-form';
    form.innerHTML = `
      <label>Mức độ hài lòng
        <select class="form-control" name="rating" required>
          <option value="">Chọn số sao</option>
          <option value="5">5 sao – Rất hài lòng</option>
          <option value="4">4 sao – Hài lòng</option>
          <option value="3">3 sao – Bình thường</option>
          <option value="2">2 sao – Chưa hài lòng</option>
          <option value="1">1 sao – Rất không hài lòng</option>
        </select>
      </label>
      <label>Góp ý (tùy chọn)
        <textarea class="form-control" name="comment" rows="3" maxlength="1000" placeholder="Điều gì bạn hài lòng hoặc muốn Dana cải thiện?"></textarea>
      </label>
      <button class="btn btn-primary" type="submit">Gửi phản hồi</button>
      <p role="status"></p>`;
    container.replaceChildren(form);
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const send = form.querySelector('button');
      const status = form.querySelector('[role="status"]');
      const rating = Number(form.elements.rating.value);
      send.disabled = true;
      status.textContent = 'Đang gửi phản hồi…';
      try {
        const response = await fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'feedback', orderId, feedbackToken, token: Auth.getToken(), rating,
            comment: form.elements.comment.value
          })
        });
        const data = await response.json();
        if (!data.ok && !data.alreadySubmitted) {
          status.textContent = data.message || 'Không thể gửi phản hồi. Vui lòng thử lại.';
          return;
        }
        const sentRating = data.ok ? rating : null;
        const receipt = readReceipt();
        if (receipt?.orderId === orderId) saveReceipt({ orderId, submitted: true, rating: sentRating });
        showSubmitted(container, sentRating, data.message);
      } catch {
        status.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
      } finally {
        send.disabled = false;
      }
    });
  }

  return { mount, readReceipt, saveReceipt, showSubmitted };
})();
