#!/usr/bin/env node
/**
 * Seed script: Upload blog images to R2 and insert blog posts into D1
 * Run: node scripts/seed-blogs.js
 * Requires: wrangler login + dana-db D1 + dana-images R2 binding
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ===== BLOG CONTENT =====
// Each blog has: id, title, category, image_key, image_path, content (rich HTML)
const BRAIN_DIR = 'C:\\Users\\sinhn\\.gemini\\antigravity\\brain\\b9524532-a292-459d-9c2b-13fc2a78eb2a';

const blogs = [
  {
    id: 'blg_dinh_duong_1',
    title: 'Sữa Hạt – "Vàng Trắng" Của Thế Kỷ XXI Trong Dinh Dưỡng Hiện Đại',
    category: 'Dinh Dưỡng',
    image_key: 'products/blog_dinh_duong_1.png',
    image_file: path.join(BRAIN_DIR, 'blog_dinh_duong_1_1777122739345.png'),
    content: `
<div class="blog-article">
  <img src="{IMAGE_URL}" alt="Sữa Hạt và các nguyên liệu tự nhiên" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" />
  
  <p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Trong bối cảnh xu hướng ăn lành mạnh ngày càng phổ biến, sữa hạt đã trở thành lựa chọn hàng đầu của hàng triệu người trên thế giới – từ vận động viên, người ăn chay cho đến các gia đình trẻ muốn kiểm soát sức khoẻ tốt hơn.</p>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">🌿 Sữa Hạt Là Gì? Tại Sao Nó Đặc Biệt?</h3>
  <p style="line-height:1.9;color:#374151;margin-bottom:20px">Sữa hạt được sản xuất bằng cách ngâm, xay và lọc các loại hạt như <strong>hạnh nhân, hạt điều, óc chó, hạt bí, macadamia</strong>... với nước tinh khiết. Không có lactose, không có hormone nhân tạo – đây là thức uống thuần thiên nhiên hoàn toàn.</p>

  <div style="background:linear-gradient(135deg,#f0faf1,#e8f5e9);border-left:4px solid #6B8F71;padding:24px;border-radius:12px;margin:28px 0">
    <p style="margin:0;color:#2d5a2d;font-weight:500;line-height:1.8">💡 <strong>Sự khác biệt cốt lõi:</strong> Không giống sữa bò công nghiệp, sữa hạt tự nấu <em>không chứa chất bảo quản, không màu nhân tạo</em> và nguyên liệu hoàn toàn kiểm soát được từ nguồn gốc đến ly uống.</p>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">📊 Bảng So Sánh Dinh Dưỡng (Mỗi 250ml)</h3>
  <div style="overflow-x:auto;margin-bottom:28px">
    <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
      <thead>
        <tr style="background:#6B8F71;color:white">
          <th style="padding:12px 16px;text-align:left;border-radius:8px 0 0 0">Loại sữa</th>
          <th style="padding:12px 16px;text-align:center">Calo</th>
          <th style="padding:12px 16px;text-align:center">Protein</th>
          <th style="padding:12px 16px;text-align:center">Chất béo</th>
          <th style="padding:12px 16px;text-align:center;border-radius:0 8px 0 0">Lactose</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background:#f9f9f9">
          <td style="padding:12px 16px;font-weight:600;color:#6B8F71">🌰 Sữa Hạnh Nhân</td>
          <td style="padding:12px 16px;text-align:center">39 kcal</td>
          <td style="padding:12px 16px;text-align:center">1.5g</td>
          <td style="padding:12px 16px;text-align:center">3g</td>
          <td style="padding:12px 16px;text-align:center">❌ Không</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-weight:600;color:#6B8F71">🥜 Sữa Hạt Điều</td>
          <td style="padding:12px 16px;text-align:center">45 kcal</td>
          <td style="padding:12px 16px;text-align:center">1.8g</td>
          <td style="padding:12px 16px;text-align:center">3.5g</td>
          <td style="padding:12px 16px;text-align:center">❌ Không</td>
        </tr>
        <tr style="background:#f9f9f9">
          <td style="padding:12px 16px;font-weight:600;color:#888">🐄 Sữa Bò</td>
          <td style="padding:12px 16px;text-align:center">149 kcal</td>
          <td style="padding:12px 16px;text-align:center">8g</td>
          <td style="padding:12px 16px;text-align:center">8g</td>
          <td style="padding:12px 16px;text-align:center">✅ Có</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">✅ 5 Lý Do Chuyên Gia Dinh Dưỡng Khuyên Dùng Sữa Hạt</h3>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px">
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px">
      <div style="font-size:2rem;margin-bottom:8px">🫀</div>
      <h4 style="color:#1a202c;margin-bottom:8px">Tốt cho tim mạch</h4>
      <p style="font-size:0.875rem;color:#6B7280;line-height:1.7">Axit béo không bão hoà trong hạt điều và hạnh nhân giúp giảm LDL cholesterol – yếu tố nguy cơ chính gây bệnh tim.</p>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px">
      <div style="font-size:2rem;margin-bottom:8px">⚖️</div>
      <h4 style="color:#1a202c;margin-bottom:8px">Quản lý cân nặng</h4>
      <p style="font-size:0.875rem;color:#6B7280;line-height:1.7">Calo thấp hơn sữa bò tới 70%, phù hợp tích hợp vào thực đơn giảm cân hoặc duy trì vóc dáng lý tưởng.</p>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px">
      <div style="font-size:2rem;margin-bottom:8px">🌱</div>
      <h4 style="color:#1a202c;margin-bottom:8px">Thân thiện môi trường</h4>
      <p style="font-size:0.875rem;color:#6B7280;line-height:1.7">Sản xuất sữa hạt tiêu thụ ít nước và phát thải CO₂ ít hơn tới 60% so với chăn nuôi bò sữa.</p>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px">
      <div style="font-size:2rem;margin-bottom:8px">🧬</div>
      <h4 style="color:#1a202c;margin-bottom:8px">Không dị ứng lactose</h4>
      <p style="font-size:0.875rem;color:#6B7280;line-height:1.7">Hoàn toàn phù hợp với 65% dân số thế giới có khả năng không hấp thu lactose sau tuổi trưởng thành.</p>
    </div>
  </div>

  <div style="background:#1a2e1a;color:white;border-radius:16px;padding:28px;margin-top:32px">
    <h4 style="color:#a8d5a2;margin-bottom:12px">🌟 Lời Khuyên Từ Dana</h4>
    <p style="color:rgba(255,255,255,0.85);line-height:1.8;margin:0">Hãy bắt đầu bằng một ly sữa hạt tự nhiên mỗi sáng – không đường thêm, không chất bảo quản – và cảm nhận sự khác biệt sau 2 tuần. <strong style="color:#a8d5a2">Cơ thể bạn sẽ tự cảm ơn bạn. 💚</strong></p>
  </div>
</div>`
  },
  {
    id: 'blg_dinh_duong_2',
    title: 'Hạnh Nhân vs Hạt Điều: Chọn Loại Sữa Hạt Nào Phù Hợp Nhất Với Bạn?',
    category: 'Dinh Dưỡng',
    image_key: 'products/blog_dinh_duong_2.png',
    image_file: path.join(BRAIN_DIR, 'blog_dinh_duong_2_1777122756176.png'),
    content: `
<div class="blog-article">
  <img src="{IMAGE_URL}" alt="Sữa hạnh nhân thuần tự nhiên" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" />
  
  <p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Khi lần đầu tiếp cận với thế giới sữa hạt, câu hỏi phổ biến nhất mà khách hàng Dana thường hỏi là: <em>"Tôi nên chọn hạnh nhân hay hạt điều?"</em> Bài viết này sẽ giúp bạn trả lời dứt khoát câu hỏi đó.</p>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">🌰 Sữa Hạnh Nhân – Thanh Tao & Nhẹ Nhàng</h3>
  <p style="line-height:1.9;color:#374151;margin-bottom:20px">Hạnh nhân (<em>Prunus dulcis</em>) được mệnh danh là "vua của các loại hạt" nhờ hàm lượng dinh dưỡng vượt trội. Sữa hạnh nhân có vị nhẹ nhàng, thanh mát – lý tưởng cho những ai thích uống không ngọt.</p>
  
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:24px">
    <h4 style="color:#92400e;margin-bottom:12px">🏆 Hạnh Nhân Nổi Bật Với:</h4>
    <ul style="color:#78350f;line-height:2;margin:0;padding-left:20px">
      <li><strong>Vitamin E</strong> cao nhất trong các loại hạt – chống lão hóa, bảo vệ da</li>
      <li><strong>Canxi tự nhiên</strong> – hỗ trợ xương chắc khoẻ không cần bổ sung ngoài</li>
      <li><strong>39 kcal/250ml</strong> – thấp nhất trong tất cả các loại sữa thực vật</li>
      <li><strong>Magie & Phospho</strong> – hỗ trợ não bộ, giảm căng thẳng hiệu quả</li>
    </ul>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">🥜 Sữa Hạt Điều – Béo Ngậy & Đậm Vị</h3>
  <p style="line-height:1.9;color:#374151;margin-bottom:20px">Hạt điều (<em>Anacardium occidentale</em>) – đặc sản nhiệt đới Việt Nam – tạo ra loại sữa có độ sánh béo tự nhiên, vị ngọt dịu không cần thêm đường. Đặc biệt phổ biến trong pha chế cà phê và làm bánh.</p>

  <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin-bottom:24px">
    <h4 style="color:#0c4a6e;margin-bottom:12px">🏆 Hạt Điều Nổi Bật Với:</h4>
    <ul style="color:#075985;line-height:2;margin:0;padding-left:20px">
      <li><strong>Kẽm & Sắt</strong> – hỗ trợ hệ miễn dịch và tạo hồng cầu</li>
      <li><strong>Texture béo ngậy</strong> – thay thế hoàn hảo cho kem sữa trong đồ uống</li>
      <li><strong>Tryptophan</strong> – tiền chất serotonin, cải thiện tâm trạng và giấc ngủ</li>
      <li><strong>Vị ngọt tự nhiên</strong> – không cần thêm đường vẫn thơm ngon</li>
    </ul>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">🎯 Chọn Loại Nào? – Bảng Quyết Định Nhanh</h3>
  <div style="overflow-x:auto;margin-bottom:28px">
    <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
      <thead>
        <tr style="background:#6B8F71;color:white">
          <th style="padding:12px 16px;text-align:left">Nếu bạn...</th>
          <th style="padding:12px 16px;text-align:center">Chọn</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background:#f9f9f9">
          <td style="padding:12px 16px">Muốn giảm cân, uống hàng ngày</td>
          <td style="padding:12px 16px;text-align:center;font-weight:700;color:#6B8F71">🌰 Hạnh Nhân</td>
        </tr>
        <tr>
          <td style="padding:12px 16px">Thích pha cà phê, làm bánh, nấu ăn</td>
          <td style="padding:12px 16px;text-align:center;font-weight:700;color:#6B8F71">🥜 Hạt Điều</td>
        </tr>
        <tr style="background:#f9f9f9">
          <td style="padding:12px 16px">Muốn chăm sóc da, chống lão hóa</td>
          <td style="padding:12px 16px;text-align:center;font-weight:700;color:#6B8F71">🌰 Hạnh Nhân</td>
        </tr>
        <tr>
          <td style="padding:12px 16px">Tập gym, cần phục hồi sau tập</td>
          <td style="padding:12px 16px;text-align:center;font-weight:700;color:#6B8F71">🥜 Hạt Điều</td>
        </tr>
        <tr style="background:#f9f9f9">
          <td style="padding:12px 16px">Trẻ em, người cao tuổi cần canxi</td>
          <td style="padding:12px 16px;text-align:center;font-weight:700;color:#6B8F71">🌰 Hạnh Nhân</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div style="background:linear-gradient(135deg,#6B8F71,#4a7a52);color:white;border-radius:16px;padding:28px;margin-top:32px;text-align:center">
    <h4 style="color:white;margin-bottom:12px;font-size:1.2rem">💚 Bí quyết của Dana</h4>
    <p style="color:rgba(255,255,255,0.9);line-height:1.8;margin:0">Đừng chọn một – <strong>hãy dùng xen kẽ cả hai!</strong> Buổi sáng: hạnh nhân để tỉnh táo nhẹ nhàng. Buổi tối: hạt điều để thư giãn và ngủ ngon hơn.</p>
  </div>
</div>`
  },
  {
    id: 'blg_cong_thuc_1',
    title: 'Công Thức Làm Sữa Hạt Điều Tại Nhà Chỉ Trong 15 Phút – Ngon Hơn Mua Ngoài',
    category: 'Công Thức',
    image_key: 'products/blog_cong_thuc_1.png',
    image_file: path.join(BRAIN_DIR, 'blog_cong_thuc_1_1777122832816.png'),
    content: `
<div class="blog-article">
  <img src="{IMAGE_URL}" alt="Quy trình làm sữa hạt tại nhà" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" />
  
  <p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Sữa hạt điều tự nấu có vị ngon hơn hẳn, không chứa chất bảo quản, và bạn hoàn toàn kiểm soát được độ ngọt. Hơn nữa, chi phí chỉ bằng 30% so với mua ngoài tiệm!</p>

  <div style="background:#f0faf1;border-radius:16px;padding:28px;margin-bottom:32px">
    <h3 style="color:#2d5a2d;margin-bottom:20px;font-size:1.2rem">🛒 Nguyên Liệu (Cho 1 lít sữa)</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="background:white;border-radius:10px;padding:16px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.5rem">🥜</span>
        <div><strong>150g hạt điều thô</strong><br><span style="font-size:0.8rem;color:#6B7280">Loại không rang, không muối</span></div>
      </div>
      <div style="background:white;border-radius:10px;padding:16px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.5rem">💧</span>
        <div><strong>1000ml nước lọc</strong><br><span style="font-size:0.8rem;color:#6B7280">Chia thành 200ml ngâm + 800ml xay</span></div>
      </div>
      <div style="background:white;border-radius:10px;padding:16px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.5rem">🍯</span>
        <div><strong>1 muỗng mật ong</strong><br><span style="font-size:0.8rem;color:#6B7280">Tùy khẩu vị, có thể bỏ qua</span></div>
      </div>
      <div style="background:white;border-radius:10px;padding:16px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.5rem">🧂</span>
        <div><strong>Một nhúm muối</strong><br><span style="font-size:0.8rem;color:#6B7280">Tăng vị, không bắt buộc</span></div>
      </div>
    </div>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 20px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">📋 Các Bước Thực Hiện</h3>
  
  <div style="position:relative;padding-left:32px;margin-bottom:32px">
    <div style="position:absolute;left:0;top:0;width:24px;height:24px;background:#6B8F71;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:0.75rem;font-weight:700">1</div>
    <h4 style="color:#1a202c;margin-bottom:8px">Ngâm hạt điều (4-8 tiếng hoặc qua đêm)</h4>
    <p style="color:#374151;line-height:1.8;margin-bottom:24px">Rửa sạch hạt điều, ngâm với nước lạnh tối thiểu 4 tiếng (tốt nhất qua đêm). Hạt nở ra sẽ giúp sữa mịn màng hơn và dễ tiêu hóa hơn.</p>
    
    <div style="position:absolute;left:0;top:120px;width:24px;height:24px;background:#6B8F71;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:0.75rem;font-weight:700">2</div>
    <h4 style="color:#1a202c;margin-bottom:8px;margin-top:48px">Xả nước ngâm, xay với nước mới</h4>
    <p style="color:#374151;line-height:1.8;margin-bottom:24px">Xả bỏ nước ngâm (đây là nước có chứa enzyme ức chế tiêu hóa). Cho hạt vào máy xay cùng 800ml nước sạch. Xay ở tốc độ cao trong <strong>90 giây</strong> để hỗn hợp thật mịn.</p>
    
    <div style="position:absolute;left:0;top:280px;width:24px;height:24px;background:#6B8F71;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:0.75rem;font-weight:700">3</div>
    <h4 style="color:#1a202c;margin-bottom:8px;margin-top:48px">Lọc qua vải cheesecloth (Tùy chọn)</h4>
    <p style="color:#374151;line-height:1.8;margin-bottom:24px">Đặt vải lọc trên tô lớn, đổ hỗn hợp vào và vắt nhẹ. Phần bã hạt điều còn lại có thể dùng làm bánh hoặc thêm vào cháo. <em>Lưu ý: Sữa hạt điều không nhất thiết phải lọc vì hạt mịn hơn hạnh nhân.</em></p>
    
    <div style="position:absolute;left:0;top:460px;width:24px;height:24px;background:#6B8F71;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:0.75rem;font-weight:700">4</div>
    <h4 style="color:#1a202c;margin-bottom:8px;margin-top:48px">Nêm vị và bảo quản</h4>
    <p style="color:#374151;line-height:1.8;margin-bottom:24px">Thêm mật ong và muối, khuấy đều. Đổ vào chai thủy tinh có nắp, bảo quản trong tủ lạnh dùng trong vòng <strong>3-5 ngày</strong>. Lắc đều trước khi uống vì sữa tự nhiên sẽ tách lớp.</p>
  </div>

  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:24px;margin:32px 0">
    <h4 style="color:#92400e;margin-bottom:12px">⭐ Mẹo Của Dana Để Sữa Ngon Hơn:</h4>
    <ul style="color:#78350f;line-height:2;margin:0;padding-left:20px">
      <li>Thêm <strong>1 quả chà là khô</strong> khi xay thay cho đường – ngọt tự nhiên, giàu dinh dưỡng</li>
      <li>Thêm <strong>1/4 muỗng vani extract</strong> để sữa thơm như kem ý vị</li>
      <li>Xay với <strong>nước ấm 40°C</strong> – sữa ra mịn hơn nước lạnh</li>
      <li>Dùng máy xay <strong>Vitamix hoặc Blendtec</strong> sẽ cho kết quả tốt nhất</li>
    </ul>
  </div>

  <div style="background:#1a2e1a;color:white;border-radius:16px;padding:28px;margin-top:32px">
    <p style="color:rgba(255,255,255,0.9);line-height:1.8;margin:0;text-align:center">🌱 <strong style="color:#a8d5a2">Một mẻ sữa = 10 phút pha chế + 5 phút chuẩn bị.</strong> Bạn sẽ không bao giờ muốn mua sữa hộp nữa sau khi thử recipe này!</p>
  </div>
</div>`
  },
  {
    id: 'blg_cong_thuc_2',
    title: 'Smoothie Bowl Sữa Hạt 5 Màu – Bữa Sáng Vừa Đẹp Vừa Dinh Dưỡng Trong 10 Phút',
    category: 'Công Thức',
    image_key: 'products/blog_cong_thuc_2.png',
    image_file: path.join(BRAIN_DIR, 'blog_cong_thuc_2_1777122850417.png'),
    content: `
<div class="blog-article">
  <img src="{IMAGE_URL}" alt="Smoothie Bowl màu sắc với sữa hạt" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" />
  
  <p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Nếu bạn đang tìm kiếm một bữa sáng vừa instagram-worthy, vừa cung cấp đủ năng lượng cho một ngày dài – thì Smoothie Bowl Sữa Hạt 5 Màu chính là câu trả lời!</p>

  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:32px;text-align:center">
    <div style="background:#fce7f3;border-radius:12px;padding:16px">
      <div style="font-size:1.5rem">🐉</div>
      <div style="font-size:0.75rem;color:#be185d;font-weight:600;margin-top:4px">Thanh Long</div>
    </div>
    <div style="background:#fef3c7;border-radius:12px;padding:16px">
      <div style="font-size:1.5rem">🥭</div>
      <div style="font-size:0.75rem;color:#d97706;font-weight:600;margin-top:4px">Xoài</div>
    </div>
    <div style="background:#ede9fe;border-radius:12px;padding:16px">
      <div style="font-size:1.5rem">🫐</div>
      <div style="font-size:0.75rem;color:#7c3aed;font-weight:600;margin-top:4px">Việt Quất</div>
    </div>
    <div style="background:#dcfce7;border-radius:12px;padding:16px">
      <div style="font-size:1.5rem">🥝</div>
      <div style="font-size:0.75rem;color:#16a34a;font-weight:600;margin-top:4px">Kiwi</div>
    </div>
    <div style="background:#fff1f2;border-radius:12px;padding:16px">
      <div style="font-size:1.5rem">🍓</div>
      <div style="font-size:0.75rem;color:#e11d48;font-weight:600;margin-top:4px">Dâu Tây</div>
    </div>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">🛒 Nguyên Liệu (1 Người)</h3>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px">
    <div>
      <h4 style="color:#6B8F71;margin-bottom:12px">Phần Blend:</h4>
      <ul style="line-height:2;color:#374151;padding-left:20px;margin:0">
        <li>150ml <strong>Sữa Hạt Dana</strong> (hạnh nhân hoặc điều)</li>
        <li>1 quả chuối đông lạnh</li>
        <li>100g hỗn hợp trái cây đông lạnh</li>
        <li>1 muỗng bơ hạt điều</li>
        <li>Đá viên vừa đủ</li>
      </ul>
    </div>
    <div>
      <h4 style="color:#6B8F71;margin-bottom:12px">Topping Trang Trí:</h4>
      <ul style="line-height:2;color:#374151;padding-left:20px;margin:0">
        <li>Hoa quả tươi theo sở thích</li>
        <li>Granola giòn 2 muỗng</li>
        <li>Hạt chia 1 muỗng</li>
        <li>Mật ong để rưới</li>
        <li>Lá bạc hà trang trí</li>
      </ul>
    </div>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">⚡ Thực Hiện Cực Nhanh – 10 Phút</h3>
  
  <div style="display:flex;flex-direction:column;gap:16px;margin-bottom:28px">
    <div style="display:flex;gap:16px;align-items:flex-start;background:#f9fafb;border-radius:12px;padding:16px">
      <div style="background:#6B8F71;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">1</div>
      <div>
        <strong>Blend phần kem nền</strong> – Cho tất cả nguyên liệu blend vào máy xay, xay ở tốc độ cao đến khi hỗn hợp mịn đặc như kem. <em>Lưu ý: Không thêm quá nhiều nước – bowl phải đặc để topping không chìm.</em>
      </div>
    </div>
    <div style="display:flex;gap:16px;align-items:flex-start;background:#f9fafb;border-radius:12px;padding:16px">
      <div style="background:#6B8F71;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">2</div>
      <div>
        <strong>Đổ vào tô rồi trang trí ngay</strong> – Chia mặt tô thành 5 khu vực theo màu trái cây. Xếp granola thành dải, rắc hạt chia đều, rưới mật ong theo đường zigzag.
      </div>
    </div>
    <div style="display:flex;gap:16px;align-items:flex-start;background:#f9fafb;border-radius:12px;padding:16px">
      <div style="background:#6B8F71;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">3</div>
      <div>
        <strong>Ăn ngay!</strong> – Smoothie Bowl ngon nhất khi ăn trong vòng 5 phút sau khi làm xong để topping còn giòn và màu sắc còn tươi.
      </div>
    </div>
  </div>

  <div style="background:linear-gradient(135deg,#fce7f3,#ede9fe,#dcfce7);border-radius:16px;padding:24px;margin:32px 0">
    <h4 style="color:#1a202c;margin-bottom:12px">📸 Mẹo Chụp Ảnh Đẹp Cho Instagram:</h4>
    <ul style="color:#374151;line-height:1.9;margin:0;padding-left:20px">
      <li>Chụp từ góc <strong>90° từ trên xuống (flat lay)</strong></li>
      <li>Dùng tô <strong>màu trắng hoặc đen</strong> để làm nổi màu topping</li>
      <li>Chụp gần cửa sổ để có <strong>ánh sáng tự nhiên đẹp</strong></li>
      <li>Thêm 1-2 nguyên liệu rải xung quanh tô để có <strong>context</strong></li>
    </ul>
  </div>

  <p style="font-size:1rem;line-height:1.9;color:#374151;background:#f0faf1;border-radius:12px;padding:20px">🌱 <strong>Giá trị dinh dưỡng ước tính:</strong> ~320 kcal | 8g protein | 52g carbs | 12g fat (chất béo lành mạnh) – Đủ no đến tận trưa!</p>
</div>`
  },
  {
    id: 'blg_fitness_1',
    title: 'Sữa Hạt Và Thể Hình: Bí Kíp Phục Hồi Sau Tập Luyện Của Các Vận Động Viên',
    category: 'Fitness',
    image_key: 'products/blog_fitness_1.png',
    image_file: path.join(BRAIN_DIR, 'blog_fitness_1_1777122868611.png'),
    content: `
<div class="blog-article">
  <img src="{IMAGE_URL}" alt="Vận động viên uống sữa hạt sau tập gym" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" />
  
  <p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">35 phút sau khi tập luyện cường độ cao là "<strong>cửa sổ vàng</strong>" – giai đoạn cơ thể hấp thụ dinh dưỡng hiệu quả nhất để tái tạo và phát triển cơ bắp. Sữa hạt có thể là đồng minh hoàn hảo trong giai đoạn này nếu bạn biết cách dùng đúng.</p>

  <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:white;border-radius:16px;padding:28px;margin-bottom:32px">
    <h3 style="color:#a8d5a2;margin-bottom:16px">⚡ "Cửa Sổ Vàng" Sau Tập – Khoa Học Nói Gì?</h3>
    <p style="color:rgba(255,255,255,0.85);line-height:1.9;margin:0">Trong 30-45 phút sau buổi tập, enzyme <em>glycogen synthase</em> hoạt động tối đa, giúp cơ thể chuyển hóa glucose thành glycogen cơ nhanh gấp 3-4 lần bình thường. Đây là lý do bạn cần nạp đúng loại dinh dưỡng vào đúng thời điểm.</p>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">🏋️ Tại Sao Sữa Hạt Lại Phù Hợp Sau Tập?</h3>
  
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:28px">
    <div style="background:#f0faf1;border-radius:12px;padding:20px;text-align:center">
      <div style="font-size:2.5rem;margin-bottom:8px">🫀</div>
      <h4 style="color:#2d5a2d;margin-bottom:8px;font-size:0.95rem">Chống Viêm Nhanh</h4>
      <p style="font-size:0.8rem;color:#374151;margin:0;line-height:1.7">Omega-6 trong hạt điều giảm viêm cơ bắp sau vận động cao độ</p>
    </div>
    <div style="background:#f0faf1;border-radius:12px;padding:20px;text-align:center">
      <div style="font-size:2.5rem;margin-bottom:8px">⚡</div>
      <h4 style="color:#2d5a2d;margin-bottom:8px;font-size:0.95rem">Nạp Năng Lượng</h4>
      <p style="font-size:0.8rem;color:#374151;margin:0;line-height:1.7">Carb tự nhiên từ hạt giúp tái tạo glycogen đã tiêu hao khi tập</p>
    </div>
    <div style="background:#f0faf1;border-radius:12px;padding:20px;text-align:center">
      <div style="font-size:2.5rem;margin-bottom:8px">💧</div>
      <h4 style="color:#2d5a2d;margin-bottom:8px;font-size:0.95rem">Bù Điện Giải</h4>
      <p style="font-size:0.8rem;color:#374151;margin:0;line-height:1.7">Kali, Magie, Canxi trong sữa hạt bù khoáng chất mất qua mồ hôi</p>
    </div>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">🥤 Công Thức Protein Shake Cho Từng Mục Tiêu</h3>
  
  <div style="display:flex;flex-direction:column;gap:20px;margin-bottom:28px">
    <div style="border:2px solid #6B8F71;border-radius:16px;padding:24px">
      <h4 style="color:#6B8F71;margin-bottom:12px">💪 Mục Tiêu: Tăng Cơ (Bulking)</h4>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">
        <span style="background:#e8f5e9;color:#2d5a2d;padding:4px 12px;border-radius:20px;font-size:0.85rem">300ml Sữa Hạt</span>
        <span style="background:#e8f5e9;color:#2d5a2d;padding:4px 12px;border-radius:20px;font-size:0.85rem">1 scoop Whey Protein</span>
        <span style="background:#e8f5e9;color:#2d5a2d;padding:4px 12px;border-radius:20px;font-size:0.85rem">1 quả chuối</span>
        <span style="background:#e8f5e9;color:#2d5a2d;padding:4px 12px;border-radius:20px;font-size:0.85rem">2 muỗng bơ đậu phộng</span>
      </div>
      <p style="font-size:0.85rem;color:#374151;margin:0">~550 kcal | 35g Protein | 60g Carbs</p>
    </div>
    
    <div style="border:2px solid #38bdf8;border-radius:16px;padding:24px">
      <h4 style="color:#0284c7;margin-bottom:12px">🔥 Mục Tiêu: Đốt Mỡ (Cutting)</h4>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">
        <span style="background:#e0f2fe;color:#0369a1;padding:4px 12px;border-radius:20px;font-size:0.85rem">250ml Sữa Hạnh Nhân</span>
        <span style="background:#e0f2fe;color:#0369a1;padding:4px 12px;border-radius:20px;font-size:0.85rem">1 scoop Protein Isolate</span>
        <span style="background:#e0f2fe;color:#0369a1;padding:4px 12px;border-radius:20px;font-size:0.85rem">1/2 quả bơ</span>
        <span style="background:#e0f2fe;color:#0369a1;padding:4px 12px;border-radius:20px;font-size:0.85rem">Đá viên</span>
      </div>
      <p style="font-size:0.85rem;color:#374151;margin:0">~320 kcal | 30g Protein | 15g Carbs</p>
    </div>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">📅 Lịch Uống Sữa Hạt Cho Người Tập Gym</h3>
  <div style="overflow-x:auto;margin-bottom:28px">
    <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
      <thead>
        <tr style="background:#1a2e1a;color:white">
          <th style="padding:12px 16px;text-align:left">Thời Điểm</th>
          <th style="padding:12px 16px;text-align:center">Lượng</th>
          <th style="padding:12px 16px;text-align:center">Mục Đích</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background:#f9f9f9">
          <td style="padding:12px 16px;font-weight:600">🌅 Buổi sáng (trước tập 1h)</td>
          <td style="padding:12px 16px;text-align:center">200ml</td>
          <td style="padding:12px 16px;text-align:center">Cung cấp năng lượng bền dài</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-weight:600">⚡ Ngay sau tập (30 phút)</td>
          <td style="padding:12px 16px;text-align:center">300ml + Protein</td>
          <td style="padding:12px 16px;text-align:center">Tái tạo cơ & glycogen</td>
        </tr>
        <tr style="background:#f9f9f9">
          <td style="padding:12px 16px;font-weight:600">🌙 Trước khi ngủ</td>
          <td style="padding:12px 16px;text-align:center">150ml</td>
          <td style="padding:12px 16px;text-align:center">Cung cấp amino acid qua đêm</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:white;border-radius:16px;padding:28px;margin-top:32px;text-align:center">
    <h4 style="color:#a8d5a2;margin-bottom:12px">💚 Dana Kết Luận</h4>
    <p style="color:rgba(255,255,255,0.85);line-height:1.8;margin:0">Sữa hạt không thay thế protein shake hoàn toàn, nhưng là <strong style="color:#a8d5a2">nền tảng dinh dưỡng lành mạnh</strong> giúp cơ thể tận dụng tối đa protein bổ sung và phục hồi nhanh hơn sau mỗi buổi tập.</p>
  </div>
</div>`
  },
  {
    id: 'blg_gia_dinh_1',
    title: 'Sữa Hạt Cho Cả Gia Đình: Từ Em Bé Đến Ông Bà – Ai Cũng Uống Được!',
    category: 'Gia Đình',
    image_key: 'products/blog_gia_dinh_1.png',
    image_file: path.join(BRAIN_DIR, 'blog_gia_dinh_1_1777122883599.png'),
    content: `
<div class="blog-article">
  <img src="{IMAGE_URL}" alt="Gia đình hạnh phúc dùng bữa sáng cùng sữa hạt" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" />
  
  <p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Một sản phẩm tốt cho mọi thành viên trong gia đình – đó là giá trị cốt lõi mà Sữa Hạt Dana mang lại. Từ bé 2 tuổi đang phát triển đến ông bà cần chế độ dinh dưỡng đặc biệt, sữa hạt đều có thể đồng hành.</p>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px">
    <div style="background:linear-gradient(135deg,#fce7f3,#fbcfe8);border-radius:16px;padding:24px">
      <div style="font-size:2rem;margin-bottom:8px">👶</div>
      <h3 style="color:#be185d;margin-bottom:12px">Em Bé & Trẻ Nhỏ (2-10 tuổi)</h3>
      <p style="color:#9d174d;line-height:1.8;font-size:0.9rem">Trẻ trên 2 tuổi có thể uống sữa hạt như thức uống phụ bên cạnh sữa mẹ hoặc sữa công thức. <strong>Không nên dùng làm sữa chính</strong> trước 2 tuổi.</p>
      <div style="background:rgba(255,255,255,0.7);border-radius:10px;padding:12px;margin-top:12px">
        <p style="font-size:0.8rem;color:#9d174d;margin:0;font-weight:600">✅ Phù hợp:</p>
        <ul style="font-size:0.8rem;color:#9d174d;margin:4px 0 0;padding-left:16px;line-height:1.8">
          <li>Trẻ không dung nạp được lactose</li>
          <li>Bổ sung trước/sau bữa ăn</li>
          <li>Pha sinh tố hoa quả cho bé</li>
        </ul>
      </div>
    </div>
    
    <div style="background:linear-gradient(135deg,#dbeafe,#bfdbfe);border-radius:16px;padding:24px">
      <div style="font-size:2rem;margin-bottom:8px">🧑</div>
      <h3 style="color:#1d4ed8;margin-bottom:12px">Thanh Thiếu Niên (10-25 tuổi)</h3>
      <p style="color:#1e40af;line-height:1.8;font-size:0.9rem">Giai đoạn phát triển xương và cơ bắp mạnh nhất. Sữa hạnt cung cấp canxi, magie, và vitamin E hỗ trợ tăng trưởng chiều cao và trí não.</p>
      <div style="background:rgba(255,255,255,0.7);border-radius:10px;padding:12px;margin-top:12px">
        <p style="font-size:0.8rem;color:#1e40af;margin:0;font-weight:600">✅ Phù hợp:</p>
        <ul style="font-size:0.8rem;color:#1e40af;margin:4px 0 0;padding-left:16px;line-height:1.8">
          <li>Uống sau tập thể thao, gym</li>
          <li>Giảm mụn/mụn trứng cá (không hormone)</li>
          <li>Tập trung học tập nhờ Omega-9</li>
        </ul>
      </div>
    </div>
    
    <div style="background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-radius:16px;padding:24px">
      <div style="font-size:2rem;margin-bottom:8px">👩</div>
      <h3 style="color:#065f46;margin-bottom:12px">Người Lớn & Phụ Nữ (25-50 tuổi)</h3>
      <p style="color:#047857;line-height:1.8;font-size:0.9rem">Phụ nữ đặc biệt được lợi từ sữa hạnh nhân nhờ vitamin E chống lão hóa và magie hỗ trợ chu kỳ kinh nguyệt đều đặn.</p>
      <div style="background:rgba(255,255,255,0.7);border-radius:10px;padding:12px;margin-top:12px">
        <p style="font-size:0.8rem;color:#047857;margin:0;font-weight:600">✅ Phù hợp:</p>
        <ul style="font-size:0.8rem;color:#047857;margin:4px 0 0;padding-left:16px;line-height:1.8">
          <li>Phụ nữ mang thai (tham khảo bác sĩ)</li>
          <li>Quản lý cân nặng sau sinh</li>
          <li>Bảo vệ da và tóc từ bên trong</li>
        </ul>
      </div>
    </div>
    
    <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:16px;padding:24px">
      <div style="font-size:2rem;margin-bottom:8px">👴</div>
      <h3 style="color:#92400e;margin-bottom:12px">Người Cao Tuổi (50+ tuổi)</h3>
      <p style="color:#78350f;line-height:1.8;font-size:0.9rem">Người lớn tuổi thường mất khả năng tiêu hóa lactose. Sữa hạt nhẹ nhàng hơn, dễ hấp thụ và không gây đầy bụng.</p>
      <div style="background:rgba(255,255,255,0.7);border-radius:10px;padding:12px;margin-top:12px">
        <p style="font-size:0.8rem;color:#78350f;margin:0;font-weight:600">✅ Phù hợp:</p>
        <ul style="font-size:0.8rem;color:#78350f;margin:4px 0 0;padding-left:16px;line-height:1.8">
          <li>Người tiểu đường (không đường)</li>
          <li>Hỗ trợ khớp xương (Canxi hạnh nhân)</li>
          <li>Giảm cholesterol tim mạch</li>
        </ul>
      </div>
    </div>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">📋 Lưu Ý Quan Trọng Trước Khi Cho Trẻ Uống</h3>
  <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;padding:24px;margin-bottom:28px">
    <ul style="color:#9f1239;line-height:2;margin:0;padding-left:20px">
      <li><strong>Không dùng cho trẻ dưới 1 tuổi</strong> vì chưa phù hợp hệ tiêu hóa non nớt</li>
      <li><strong>Kiểm tra dị ứng hạt</strong> – Cho bé thử lượng nhỏ đầu tiên và quan sát 24 giờ</li>
      <li><strong>Không thay thế 100% sữa mẹ/sữa công thức</strong> cho trẻ dưới 2 tuổi</li>
      <li><strong>Chọn loại không đường</strong> để tránh hình thành thói quen ăn ngọt sớm</li>
    </ul>
  </div>

  <div style="background:linear-gradient(135deg,#6B8F71,#4a7a52);color:white;border-radius:16px;padding:28px;margin-top:32px">
    <h4 style="color:#d4edda;margin-bottom:16px;font-size:1.1rem">🏡 Routine Sáng Của Gia Đình Lành Mạnh</h4>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:16px">
        <p style="color:#d4edda;font-size:0.85rem;margin:0"><strong>Bé nhỏ:</strong> 100ml sữa hạnh nhân pha ấm + bữa ăn sáng nhẹ</p>
      </div>
      <div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:16px">
        <p style="color:#d4edda;font-size:0.85rem;margin:0"><strong>Bé lớn/teens:</strong> Smoothie sữa hạt + trái cây trước giờ đến trường</p>
      </div>
      <div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:16px">
        <p style="color:#d4edda;font-size:0.85rem;margin:0"><strong>Bố/Mẹ:</strong> Cà phê sữa hạt điều + granola ăn kèm</p>
      </div>
      <div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:16px">
        <p style="color:#d4edda;font-size:0.85rem;margin:0"><strong>Ông/Bà:</strong> 200ml sữa hạnh nhân ấm nhẹ không đường</p>
      </div>
    </div>
  </div>
</div>`
  }
];

// ===== UPLOAD IMAGES TO R2 =====
console.log('📤 Uploading images to R2...');
const imageUrls = {};

for (const blog of blogs) {
  if (fs.existsSync(blog.image_file)) {
    try {
      const result = execSync(
        `npx wrangler r2 object put dana-images/${blog.image_key} --file "${blog.image_file}" --content-type image/png`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      imageUrls[blog.id] = `/cdn/${blog.image_key}`;
      console.log(`  ✅ Uploaded: ${blog.image_key}`);
    } catch (err) {
      console.log(`  ⚠️  Upload failed for ${blog.image_key}, using placeholder`);
      imageUrls[blog.id] = 'assets/images/logo.jpeg';
    }
  } else {
    console.log(`  ⚠️  File not found: ${blog.image_file}, using placeholder`);
    imageUrls[blog.id] = 'assets/images/logo.jpeg';
  }
}

// ===== GENERATE SQL =====
console.log('\n📝 Generating SQL insert statements...');
const sqlStatements = [];

for (const blog of blogs) {
  const imageUrl = imageUrls[blog.id] || 'assets/images/logo.jpeg';
  const content = blog.content.replace('{IMAGE_URL}', imageUrl).trim();
  
  // Escape single quotes for SQL
  const safeTitle = blog.title.replace(/'/g, "''");
  const safeCategory = blog.category.replace(/'/g, "''");
  const safeContent = content.replace(/'/g, "''");
  const safeImageUrl = imageUrl.replace(/'/g, "''");
  
  sqlStatements.push(
    `INSERT OR REPLACE INTO blogs (id, title, category, content, image_url, is_active, created_at) VALUES ('${blog.id}', '${safeTitle}', '${safeCategory}', '${safeContent}', '${safeImageUrl}', 1, datetime('now', '-${Math.floor(Math.random() * 30)} days'));`
  );
}

const sqlFile = 'scripts/seed-blogs.sql';
fs.writeFileSync(sqlFile, sqlStatements.join('\n\n'));
console.log(`  ✅ SQL written to ${sqlFile}`);

// ===== EXECUTE SQL =====
console.log('\n🗄️  Inserting blogs into D1 database...');
try {
  const result = execSync(
    `npx wrangler d1 execute dana-db --remote --file="${sqlFile}"`,
    { encoding: 'utf8', stdio: 'pipe' }
  );
  console.log('  ✅ Blogs inserted successfully!');
  console.log(result);
} catch (err) {
  console.log('  ❌ Database insert failed. Trying local...');
  console.log(err.message);
  try {
    const result = execSync(
      `npx wrangler d1 execute dana-db --local --file="${sqlFile}"`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    console.log('  ✅ Inserted to local DB');
  } catch (err2) {
    console.log('  ❌ Local DB also failed:', err2.message);
    console.log('\n📋 Please run this SQL manually in Cloudflare D1 Console:');
    console.log(fs.readFileSync(sqlFile, 'utf8'));
  }
}

console.log('\n✨ Done! Open your blog page to see the new posts.');
