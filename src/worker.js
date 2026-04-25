/* ===================================================
   Cloudflare Worker - Main Entry Point
   Sữa Hạt Dana - hnguyenworks.id.vn
   Routes all /api/* requests to handlers
   =================================================== */

import { onRequestPost as authPost } from '../functions/api/auth.js';
import { onRequestGet as cartGet, onRequestPost as cartPost } from '../functions/api/cart.js';
import { onRequestGet as productsGet } from '../functions/api/products.js';
import { onRequestPost as ordersPost, onRequestGet as ordersGet, onRequestPut as ordersPut } from '../functions/api/orders.js';
import { onRequestPost as contactPost } from '../functions/api/contact.js';
import { onRequestPost as uploadPost } from '../functions/api/upload.js';
import { onRequestGet as dashboardGet, onRequestPost as dashboardPost } from '../functions/api/admin/dashboard.js';
import { onRequestGet as blogsGet } from '../functions/api/blogs.js';

// CORS headers
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function corsResponse(response) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

// Auto-migration: ensure blogs table exists and seed initial content
async function runMigrations(env) {
  try {
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT,
      content TEXT,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category)`).run();

    // Check if blogs already seeded
    const existing = await env.DB.prepare('SELECT COUNT(*) as c FROM blogs').first();
    if (existing && existing.c > 0) return; // already seeded

    // Seed 6 initial blog posts
    const BLOGS = [
      {
        id: 'blg_dinh_duong_1',
        title: 'Sữa Hạt – "Vàng Trắng" Của Thế Kỷ XXI Trong Dinh Dưỡng Hiện Đại',
        category: 'Dinh Dưỡng',
        image_url: '/cdn/products/blog_dinh_duong_1.png',
        days_ago: 9,
        content: `<div class="blog-article"><img src="/cdn/products/blog_dinh_duong_1.png" alt="Sữa Hạt và các nguyên liệu tự nhiên" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" /><p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Trong bối cảnh xu hướng ăn lành mạnh ngày càng phổ biến, sữa hạt đã trở thành lựa chọn hàng đầu của hàng triệu người trên thế giới – từ vận động viên, người ăn chay cho đến các gia đình trẻ muốn kiểm soát sức khoẻ tốt hơn.</p><h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">🌿 Sữa Hạt Là Gì? Tại Sao Nó Đặc Biệt?</h3><p style="line-height:1.9;color:#374151;margin-bottom:20px">Sữa hạt được sản xuất bằng cách ngâm, xay và lọc các loại hạt như <strong>hạnh nhân, hạt điều, óc chó, hạt bí, macadamia</strong>... với nước tinh khiết. Không có lactose, không có hormone nhân tạo – đây là thức uống thuần thiên nhiên hoàn toàn.</p><div style="background:linear-gradient(135deg,#f0faf1,#e8f5e9);border-left:4px solid #6B8F71;padding:24px;border-radius:12px;margin:28px 0"><p style="margin:0;color:#2d5a2d;font-weight:500;line-height:1.8">💡 <strong>Sự khác biệt cốt lõi:</strong> Không giống sữa bò công nghiệp, sữa hạt tự nấu <em>không chứa chất bảo quản, không màu nhân tạo</em> và nguyên liệu hoàn toàn kiểm soát được từ nguồn gốc đến ly uống.</p></div><h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">📊 Bảng So Sánh Dinh Dưỡng (Mỗi 250ml)</h3><div style="overflow-x:auto;margin-bottom:28px"><table style="width:100%;border-collapse:collapse;font-size:0.9rem"><thead><tr style="background:#6B8F71;color:white"><th style="padding:12px 16px;text-align:left">Loại sữa</th><th style="padding:12px 16px;text-align:center">Calo</th><th style="padding:12px 16px;text-align:center">Protein</th><th style="padding:12px 16px;text-align:center">Lactose</th></tr></thead><tbody><tr style="background:#f9f9f9"><td style="padding:12px 16px;font-weight:600;color:#6B8F71">🌰 Sữa Hạnh Nhân</td><td style="padding:12px 16px;text-align:center">39 kcal</td><td style="padding:12px 16px;text-align:center">1.5g</td><td style="padding:12px 16px;text-align:center">❌ Không</td></tr><tr><td style="padding:12px 16px;font-weight:600;color:#6B8F71">🥜 Sữa Hạt Điều</td><td style="padding:12px 16px;text-align:center">45 kcal</td><td style="padding:12px 16px;text-align:center">1.8g</td><td style="padding:12px 16px;text-align:center">❌ Không</td></tr><tr style="background:#f9f9f9"><td style="padding:12px 16px;font-weight:600;color:#888">🐄 Sữa Bò</td><td style="padding:12px 16px;text-align:center">149 kcal</td><td style="padding:12px 16px;text-align:center">8g</td><td style="padding:12px 16px;text-align:center">✅ Có</td></tr></tbody></table></div><h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">✅ 5 Lý Do Chuyên Gia Dinh Dưỡng Khuyên Dùng Sữa Hạt</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px"><div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px"><div style="font-size:2rem;margin-bottom:8px">🫀</div><h4 style="color:#1a202c;margin-bottom:8px">Tốt cho tim mạch</h4><p style="font-size:0.875rem;color:#6B7280;line-height:1.7">Axit béo không bão hoà giúp giảm LDL cholesterol – yếu tố nguy cơ chính gây bệnh tim.</p></div><div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px"><div style="font-size:2rem;margin-bottom:8px">⚖️</div><h4 style="color:#1a202c;margin-bottom:8px">Quản lý cân nặng</h4><p style="font-size:0.875rem;color:#6B7280;line-height:1.7">Calo thấp hơn sữa bò tới 70%, phù hợp tích hợp vào thực đơn giảm cân hoặc duy trì vóc dáng.</p></div><div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px"><div style="font-size:2rem;margin-bottom:8px">🌱</div><h4 style="color:#1a202c;margin-bottom:8px">Thân thiện môi trường</h4><p style="font-size:0.875rem;color:#6B7280;line-height:1.7">Sản xuất sữa hạt tiêu thụ ít nước và phát thải CO₂ ít hơn tới 60% so với chăn nuôi bò sữa.</p></div><div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px"><div style="font-size:2rem;margin-bottom:8px">🧬</div><h4 style="color:#1a202c;margin-bottom:8px">Không dị ứng lactose</h4><p style="font-size:0.875rem;color:#6B7280;line-height:1.7">Hoàn toàn phù hợp với 65% dân số thế giới có khả năng không hấp thu lactose sau tuổi trưởng thành.</p></div></div><div style="background:#1a2e1a;color:white;border-radius:16px;padding:28px;margin-top:32px"><h4 style="color:#a8d5a2;margin-bottom:12px">🌟 Lời Khuyên Từ Dana</h4><p style="color:rgba(255,255,255,0.85);line-height:1.8;margin:0">Hãy bắt đầu bằng một ly sữa hạt tự nhiên mỗi sáng – không đường thêm, không chất bảo quản – và cảm nhận sự khác biệt sau 2 tuần. <strong style="color:#a8d5a2">Cơ thể bạn sẽ tự cảm ơn bạn. 💚</strong></p></div></div>`
      },
      {
        id: 'blg_dinh_duong_2',
        title: 'Hạnh Nhân vs Hạt Điều: Chọn Loại Sữa Hạt Nào Phù Hợp Nhất Với Bạn?',
        category: 'Dinh Dưỡng',
        image_url: '/cdn/products/blog_dinh_duong_2.png',
        days_ago: 13,
        content: `<div class="blog-article"><img src="/cdn/products/blog_dinh_duong_2.png" alt="Sữa hạnh nhân thuần tự nhiên" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" /><p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Khi lần đầu tiếp cận với thế giới sữa hạt, câu hỏi phổ biến nhất mà khách hàng Dana thường hỏi là: <em>"Tôi nên chọn hạnh nhân hay hạt điều?"</em> Bài viết này sẽ giúp bạn trả lời dứt khoát câu hỏi đó.</p><h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">🌰 Sữa Hạnh Nhân – Thanh Tao & Nhẹ Nhàng</h3><div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:24px"><h4 style="color:#92400e;margin-bottom:12px">🏆 Hạnh Nhân Nổi Bật Với:</h4><ul style="color:#78350f;line-height:2;margin:0;padding-left:20px"><li><strong>Vitamin E</strong> cao nhất trong các loại hạt – chống lão hóa, bảo vệ da</li><li><strong>Canxi tự nhiên</strong> – hỗ trợ xương chắc khoẻ</li><li><strong>39 kcal/250ml</strong> – thấp nhất trong tất cả các loại sữa thực vật</li><li><strong>Magie & Phospho</strong> – hỗ trợ não bộ, giảm căng thẳng</li></ul></div><h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">🥜 Sữa Hạt Điều – Béo Ngậy & Đậm Vị</h3><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin-bottom:24px"><h4 style="color:#0c4a6e;margin-bottom:12px">🏆 Hạt Điều Nổi Bật Với:</h4><ul style="color:#075985;line-height:2;margin:0;padding-left:20px"><li><strong>Kẽm & Sắt</strong> – hỗ trợ hệ miễn dịch và tạo hồng cầu</li><li><strong>Texture béo ngậy</strong> – thay thế hoàn hảo cho kem sữa trong đồ uống</li><li><strong>Tryptophan</strong> – tiền chất serotonin, cải thiện tâm trạng và giấc ngủ</li><li><strong>Vị ngọt tự nhiên</strong> – không cần thêm đường vẫn thơm ngon</li></ul></div><h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">🎯 Bảng Quyết Định Nhanh</h3><div style="overflow-x:auto;margin-bottom:28px"><table style="width:100%;border-collapse:collapse;font-size:0.9rem"><thead><tr style="background:#6B8F71;color:white"><th style="padding:12px 16px;text-align:left">Nếu bạn...</th><th style="padding:12px 16px;text-align:center">Chọn</th></tr></thead><tbody><tr style="background:#f9f9f9"><td style="padding:12px 16px">Muốn giảm cân, uống hàng ngày</td><td style="padding:12px 16px;text-align:center;font-weight:700;color:#6B8F71">🌰 Hạnh Nhân</td></tr><tr><td style="padding:12px 16px">Thích pha cà phê, làm bánh</td><td style="padding:12px 16px;text-align:center;font-weight:700;color:#6B8F71">🥜 Hạt Điều</td></tr><tr style="background:#f9f9f9"><td style="padding:12px 16px">Tập gym, cần phục hồi sau tập</td><td style="padding:12px 16px;text-align:center;font-weight:700;color:#6B8F71">🥜 Hạt Điều</td></tr><tr><td style="padding:12px 16px">Trẻ em, người cao tuổi cần canxi</td><td style="padding:12px 16px;text-align:center;font-weight:700;color:#6B8F71">🌰 Hạnh Nhân</td></tr></tbody></table></div><div style="background:linear-gradient(135deg,#6B8F71,#4a7a52);color:white;border-radius:16px;padding:28px;margin-top:32px;text-align:center"><h4 style="color:white;margin-bottom:12px">💚 Bí quyết của Dana</h4><p style="color:rgba(255,255,255,0.9);line-height:1.8;margin:0">Đừng chọn một – <strong>hãy dùng xen kẽ cả hai!</strong> Buổi sáng: hạnh nhân. Buổi tối: hạt điều để thư giãn và ngủ ngon hơn.</p></div></div>`
      },
      {
        id: 'blg_cong_thuc_1',
        title: 'Công Thức Làm Sữa Hạt Điều Tại Nhà Chỉ Trong 15 Phút – Ngon Hơn Mua Ngoài',
        category: 'Công Thức',
        image_url: '/cdn/products/blog_cong_thuc_1.png',
        days_ago: 5,
        content: `<div class="blog-article"><img src="/cdn/products/blog_cong_thuc_1.png" alt="Quy trình làm sữa hạt tại nhà" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" /><p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Sữa hạt điều tự nấu có vị ngon hơn hẳn, không chứa chất bảo quản, và bạn hoàn toàn kiểm soát được độ ngọt. Chi phí chỉ bằng 30% so với mua ngoài tiệm!</p><div style="background:#f0faf1;border-radius:16px;padding:28px;margin-bottom:32px"><h3 style="color:#2d5a2d;margin-bottom:20px">🛒 Nguyên Liệu (Cho 1 lít sữa)</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div style="background:white;border-radius:10px;padding:16px;display:flex;align-items:center;gap:12px"><span style="font-size:1.5rem">🥜</span><div><strong>150g hạt điều thô</strong><br><span style="font-size:0.8rem;color:#6B7280">Loại không rang, không muối</span></div></div><div style="background:white;border-radius:10px;padding:16px;display:flex;align-items:center;gap:12px"><span style="font-size:1.5rem">💧</span><div><strong>1000ml nước lọc</strong><br><span style="font-size:0.8rem;color:#6B7280">200ml ngâm + 800ml xay</span></div></div><div style="background:white;border-radius:10px;padding:16px;display:flex;align-items:center;gap:12px"><span style="font-size:1.5rem">🍯</span><div><strong>1 muỗng mật ong</strong><br><span style="font-size:0.8rem;color:#6B7280">Tùy khẩu vị</span></div></div><div style="background:white;border-radius:10px;padding:16px;display:flex;align-items:center;gap:12px"><span style="font-size:1.5rem">🧂</span><div><strong>Một nhúm muối</strong><br><span style="font-size:0.8rem;color:#6B7280">Tăng vị</span></div></div></div></div><h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 20px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">📋 Các Bước Thực Hiện</h3><div style="display:flex;flex-direction:column;gap:16px;margin-bottom:32px"><div style="display:flex;gap:16px;align-items:flex-start;background:#f9fafb;border-radius:12px;padding:16px"><div style="background:#6B8F71;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;min-width:32px">1</div><div><strong>Ngâm hạt điều 4-8 tiếng hoặc qua đêm.</strong> Rửa sạch, ngâm với nước lạnh. Hạt nở ra sẽ giúp sữa mịn và dễ tiêu hóa hơn.</div></div><div style="display:flex;gap:16px;align-items:flex-start;background:#f9fafb;border-radius:12px;padding:16px"><div style="background:#6B8F71;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;min-width:32px">2</div><div><strong>Xả nước ngâm, xay với 800ml nước mới.</strong> Xay ở tốc độ cao trong 90 giây để hỗn hợp thật mịn.</div></div><div style="display:flex;gap:16px;align-items:flex-start;background:#f9fafb;border-radius:12px;padding:16px"><div style="background:#6B8F71;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;min-width:32px">3</div><div><strong>Nêm vị và bảo quản.</strong> Thêm mật ong, muối và khuấy đều. Bảo quản trong chai thủy tinh, dùng trong 3-5 ngày.</div></div></div><div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:24px;margin:32px 0"><h4 style="color:#92400e;margin-bottom:12px">⭐ Mẹo Của Dana:</h4><ul style="color:#78350f;line-height:2;margin:0;padding-left:20px"><li>Thêm <strong>1 quả chà là khô</strong> khi xay thay cho đường</li><li>Thêm <strong>1/4 muỗng vani extract</strong> để sữa thơm hơn</li><li>Xay với <strong>nước ấm 40°C</strong> – sữa ra mịn hơn nước lạnh</li></ul></div><div style="background:#1a2e1a;color:white;border-radius:16px;padding:28px;margin-top:32px"><p style="color:rgba(255,255,255,0.9);line-height:1.8;margin:0;text-align:center">🌱 <strong style="color:#a8d5a2">Một mẻ sữa = 15 phút pha chế.</strong> Bạn sẽ không bao giờ muốn mua sữa hộp nữa!</p></div></div>`
      },
      {
        id: 'blg_cong_thuc_2',
        title: 'Smoothie Bowl Sữa Hạt 5 Màu – Bữa Sáng Vừa Đẹp Vừa Dinh Dưỡng Trong 10 Phút',
        category: 'Công Thức',
        image_url: '/cdn/products/blog_cong_thuc_2.png',
        days_ago: 28,
        content: `<div class="blog-article"><img src="/cdn/products/blog_cong_thuc_2.png" alt="Smoothie Bowl màu sắc" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" /><p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Nếu bạn đang tìm kiếm một bữa sáng vừa instagram-worthy, vừa cung cấp đủ năng lượng – thì Smoothie Bowl Sữa Hạt 5 Màu chính là câu trả lời!</p><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:32px;text-align:center"><div style="background:#fce7f3;border-radius:12px;padding:16px"><div style="font-size:1.5rem">🐉</div><div style="font-size:0.75rem;color:#be185d;font-weight:600;margin-top:4px">Thanh Long</div></div><div style="background:#fef3c7;border-radius:12px;padding:16px"><div style="font-size:1.5rem">🥭</div><div style="font-size:0.75rem;color:#d97706;font-weight:600;margin-top:4px">Xoài</div></div><div style="background:#ede9fe;border-radius:12px;padding:16px"><div style="font-size:1.5rem">🫐</div><div style="font-size:0.75rem;color:#7c3aed;font-weight:600;margin-top:4px">Việt Quất</div></div><div style="background:#dcfce7;border-radius:12px;padding:16px"><div style="font-size:1.5rem">🥝</div><div style="font-size:0.75rem;color:#16a34a;font-weight:600;margin-top:4px">Kiwi</div></div><div style="background:#fff1f2;border-radius:12px;padding:16px"><div style="font-size:1.5rem">🍓</div><div style="font-size:0.75rem;color:#e11d48;font-weight:600;margin-top:4px">Dâu Tây</div></div></div><h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">🛒 Nguyên Liệu</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px"><div><h4 style="color:#6B8F71;margin-bottom:12px">Phần Blend:</h4><ul style="line-height:2;color:#374151;padding-left:20px;margin:0"><li>150ml <strong>Sữa Hạt Dana</strong></li><li>1 quả chuối đông lạnh</li><li>100g hoa quả đông lạnh</li><li>1 muỗng bơ hạt điều</li></ul></div><div><h4 style="color:#6B8F71;margin-bottom:12px">Topping:</h4><ul style="line-height:2;color:#374151;padding-left:20px;margin:0"><li>Hoa quả tươi theo sở thích</li><li>Granola 2 muỗng</li><li>Hạt chia 1 muỗng</li><li>Mật ong để rưới</li></ul></div></div><div style="display:flex;flex-direction:column;gap:16px;margin-bottom:28px"><div style="display:flex;gap:16px;align-items:flex-start;background:#f9fafb;border-radius:12px;padding:16px"><div style="background:#6B8F71;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;min-width:32px">1</div><div><strong>Blend phần kem nền</strong> ở tốc độ cao đến khi hỗn hợp mịn đặc như kem.</div></div><div style="display:flex;gap:16px;align-items:flex-start;background:#f9fafb;border-radius:12px;padding:16px"><div style="background:#6B8F71;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;min-width:32px">2</div><div><strong>Đổ vào tô rồi trang trí ngay</strong> – Xếp granola, rắc hạt chia, rưới mật ong theo đường zigzag.</div></div></div><p style="font-size:1rem;line-height:1.9;color:#374151;background:#f0faf1;border-radius:12px;padding:20px">🌱 <strong>Giá trị dinh dưỡng:</strong> ~320 kcal | 8g protein | 52g carbs – Đủ no đến tận trưa!</p></div>`
      },
      {
        id: 'blg_fitness_1',
        title: 'Sữa Hạt Và Thể Hình: Bí Kíp Phục Hồi Sau Tập Luyện Của Các Vận Động Viên',
        category: 'Fitness',
        image_url: '/cdn/products/blog_fitness_1.png',
        days_ago: 7,
        content: `<div class="blog-article"><img src="/cdn/products/blog_fitness_1.png" alt="Vận động viên uống sữa hạt" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" /><p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">35 phút sau khi tập luyện cường độ cao là "<strong>cửa sổ vàng</strong>" – giai đoạn cơ thể hấp thụ dinh dưỡng hiệu quả nhất để tái tạo và phát triển cơ bắp. Sữa hạt có thể là đồng minh hoàn hảo trong giai đoạn này.</p><div style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:white;border-radius:16px;padding:28px;margin-bottom:32px"><h3 style="color:#a8d5a2;margin-bottom:16px">⚡ "Cửa Sổ Vàng" Sau Tập – Khoa Học Nói Gì?</h3><p style="color:rgba(255,255,255,0.85);line-height:1.9;margin:0">Trong 30-45 phút sau buổi tập, enzyme glycogen synthase hoạt động tối đa. Đây là lý do bạn cần nạp đúng loại dinh dưỡng vào đúng thời điểm.</p></div><h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">🏋️ Tại Sao Sữa Hạt Lại Phù Hợp Sau Tập?</h3><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:28px"><div style="background:#f0faf1;border-radius:12px;padding:20px;text-align:center"><div style="font-size:2.5rem;margin-bottom:8px">🫀</div><h4 style="color:#2d5a2d;margin-bottom:8px;font-size:0.95rem">Chống Viêm Nhanh</h4><p style="font-size:0.8rem;color:#374151;margin:0">Omega-6 giảm viêm cơ bắp sau vận động cao độ</p></div><div style="background:#f0faf1;border-radius:12px;padding:20px;text-align:center"><div style="font-size:2.5rem;margin-bottom:8px">⚡</div><h4 style="color:#2d5a2d;margin-bottom:8px;font-size:0.95rem">Nạp Năng Lượng</h4><p style="font-size:0.8rem;color:#374151;margin:0">Carb tự nhiên tái tạo glycogen đã tiêu hao</p></div><div style="background:#f0faf1;border-radius:12px;padding:20px;text-align:center"><div style="font-size:2.5rem;margin-bottom:8px">💧</div><h4 style="color:#2d5a2d;margin-bottom:8px;font-size:0.95rem">Bù Điện Giải</h4><p style="font-size:0.8rem;color:#374151;margin:0">Kali, Magie bù khoáng chất mất qua mồ hôi</p></div></div><h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">🥤 Công Thức Protein Shake Theo Mục Tiêu</h3><div style="display:flex;flex-direction:column;gap:20px;margin-bottom:28px"><div style="border:2px solid #6B8F71;border-radius:16px;padding:24px"><h4 style="color:#6B8F71;margin-bottom:12px">💪 Tăng Cơ (Bulking): 300ml Sữa Hạt + Whey Protein + Chuối + Bơ đậu phộng → ~550 kcal | 35g Protein</h4></div><div style="border:2px solid #38bdf8;border-radius:16px;padding:24px"><h4 style="color:#0284c7;margin-bottom:12px">🔥 Đốt Mỡ (Cutting): 250ml Sữa Hạnh Nhân + Protein Isolate + 1/2 Bơ → ~320 kcal | 30g Protein</h4></div></div><div style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:white;border-radius:16px;padding:28px;margin-top:32px;text-align:center"><h4 style="color:#a8d5a2;margin-bottom:12px">💚 Dana Kết Luận</h4><p style="color:rgba(255,255,255,0.85);line-height:1.8;margin:0">Sữa hạt là <strong style="color:#a8d5a2">nền tảng dinh dưỡng lành mạnh</strong> giúp cơ thể tận dụng tối đa protein và phục hồi nhanh hơn sau mỗi buổi tập.</p></div></div>`
      },
      {
        id: 'blg_gia_dinh_1',
        title: 'Sữa Hạt Cho Cả Gia Đình: Từ Em Bé Đến Ông Bà – Ai Cũng Uống Được!',
        category: 'Gia Đình',
        image_url: '/cdn/products/blog_gia_dinh_1.png',
        days_ago: 10,
        content: `<div class="blog-article"><img src="/cdn/products/blog_gia_dinh_1.png" alt="Gia đình hạnh phúc dùng sữa hạt" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" /><p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Một sản phẩm tốt cho mọi thành viên trong gia đình – đó là giá trị cốt lõi mà Sữa Hạt Dana mang lại. Từ bé 2 tuổi đến ông bà, sữa hạt đều có thể đồng hành.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px"><div style="background:linear-gradient(135deg,#fce7f3,#fbcfe8);border-radius:16px;padding:24px"><div style="font-size:2rem;margin-bottom:8px">👶</div><h3 style="color:#be185d;margin-bottom:12px">Em Bé & Trẻ Nhỏ (2-10 tuổi)</h3><p style="color:#9d174d;line-height:1.8;font-size:0.9rem">Trẻ trên 2 tuổi có thể dùng như thức uống phụ. <strong>Không nên dùng làm sữa chính</strong> trước 2 tuổi.</p></div><div style="background:linear-gradient(135deg,#dbeafe,#bfdbfe);border-radius:16px;padding:24px"><div style="font-size:2rem;margin-bottom:8px">🧑</div><h3 style="color:#1d4ed8;margin-bottom:12px">Thanh Thiếu Niên (10-25 tuổi)</h3><p style="color:#1e40af;line-height:1.8;font-size:0.9rem">Sữa hạt cung cấp canxi, magie, vitamin E hỗ trợ tăng trưởng chiều cao và trí não. Giảm mụn nhờ không có hormone.</p></div><div style="background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-radius:16px;padding:24px"><div style="font-size:2rem;margin-bottom:8px">👩</div><h3 style="color:#065f46;margin-bottom:12px">Người Lớn & Phụ Nữ (25-50 tuổi)</h3><p style="color:#047857;line-height:1.8;font-size:0.9rem">Vitamin E chống lão hóa, magie hỗ trợ chu kỳ kinh nguyệt đều đặn, canxi bảo vệ xương khớp.</p></div><div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:16px;padding:24px"><div style="font-size:2rem;margin-bottom:8px">👴</div><h3 style="color:#92400e;margin-bottom:12px">Người Cao Tuổi (50+ tuổi)</h3><p style="color:#78350f;line-height:1.8;font-size:0.9rem">Sữa hạt nhẹ nhàng hơn, dễ hấp thụ, không gây đầy bụng. Phù hợp người tiểu đường và tim mạch.</p></div></div><div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;padding:24px;margin-bottom:28px"><h4 style="color:#9f1239;margin-bottom:12px">⚠️ Lưu Ý Quan Trọng:</h4><ul style="color:#9f1239;line-height:2;margin:0;padding-left:20px"><li><strong>Không dùng cho trẻ dưới 1 tuổi</strong></li><li><strong>Kiểm tra dị ứng hạt</strong> trước khi cho bé dùng lần đầu</li><li><strong>Chọn loại không đường</strong> để tránh thói quen ăn ngọt sớm</li></ul></div><div style="background:linear-gradient(135deg,#6B8F71,#4a7a52);color:white;border-radius:16px;padding:28px;margin-top:32px"><h4 style="color:#d4edda;margin-bottom:16px">🏡 Routine Sáng Của Gia Đình Lành Mạnh</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:16px"><p style="color:#d4edda;font-size:0.85rem;margin:0"><strong>Bé nhỏ:</strong> 100ml sữa hạnh nhân pha ấm</p></div><div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:16px"><p style="color:#d4edda;font-size:0.85rem;margin:0"><strong>Teens:</strong> Smoothie sữa hạt + trái cây</p></div><div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:16px"><p style="color:#d4edda;font-size:0.85rem;margin:0"><strong>Bố/Mẹ:</strong> Cà phê sữa hạt điều + granola</p></div><div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:16px"><p style="color:#d4edda;font-size:0.85rem;margin:0"><strong>Ông/Bà:</strong> 200ml sữa hạnh nhân ấm</p></div></div></div></div>`
      }
    ];

    for (const blog of BLOGS) {
      await env.DB.prepare(
        `INSERT OR REPLACE INTO blogs (id, title, category, content, image_url, is_active, created_at) VALUES (?,?,?,?,?,1, datetime('now', ? || ' days'))`
      ).bind(blog.id, blog.title, blog.category, blog.content, blog.image_url, `-${blog.days_ago}`).run();
    }
  } catch(e) {
    console.error('Migration error:', e.message);
  }
}

let migrated = false;

export default {
  async fetch(request, env, ctx) {
    // Run migrations once per worker lifecycle
    if (!migrated) {
      await runMigrations(env);
      migrated = true;
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Serve R2 images via /cdn/*
    if (path.startsWith('/cdn/')) {
      const key = path.replace('/cdn/', '');
      try {
        const object = await env.IMAGES.get(key);
        if (!object) {
          return new Response('Not Found', { status: 404 });
        }
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('Cache-Control', 'public, max-age=31536000');
        for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
        return new Response(object.body, { headers });
      } catch(e) {
        return new Response('Error loading image', { status: 500 });
      }
    }

    // Only handle /api/* routes - let assets handle the rest
    if (!path.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    // Build context compatible with Pages Functions signature
    const context = { request, env, params: {} };
    let response;

    try {
      switch (path) {
        case '/api/auth':
          if (method === 'POST') response = await authPost(context);
          break;

        case '/api/cart':
          if (method === 'GET') response = await cartGet(context);
          else if (method === 'POST') response = await cartPost(context);
          break;

        case '/api/products':
          if (method === 'GET') response = await productsGet(context);
          break;

        case '/api/orders':
          if (method === 'GET') response = await ordersGet(context);
          else if (method === 'POST') response = await ordersPost(context);
          else if (method === 'PUT') response = await ordersPut(context);
          break;

        case '/api/contact':
          if (method === 'POST') response = await contactPost(context);
          break;

        case '/api/upload':
          if (method === 'POST') response = await uploadPost(context);
          break;

        case '/api/admin/dashboard':
          if (method === 'GET') response = await dashboardGet(context);
          else if (method === 'POST') response = await dashboardPost(context);
          break;

        case '/api/blogs':
          if (method === 'GET') response = await blogsGet(context);
          break;
      }
    } catch (err) {
      response = new Response(JSON.stringify({ ok: false, message: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!response) {
      response = new Response(JSON.stringify({ ok: false, message: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return corsResponse(response);
  },
};
