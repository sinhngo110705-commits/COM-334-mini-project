CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  content TEXT,
  image_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
INSERT OR REPLACE INTO blogs (id, title, category, content, image_url, is_active, created_at) VALUES ('blg_dinh_duong_1', 'Sá»¯a Háº¡t â€“ "VÃ ng Tráº¯ng" Cá»§a Tháº¿ Ká»· XXI Trong Dinh DÆ°á»¡ng Hiá»‡n Äáº¡i', 'Dinh DÆ°á»¡ng', '<div class="blog-article">
  <img src="/cdn/products/blog_dinh_duong_1.png" alt="Sá»¯a Háº¡t vÃ  cÃ¡c nguyÃªn liá»‡u tá»± nhiÃªn" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" />
  
  <p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Trong bá»‘i cáº£nh xu hÆ°á»›ng Äƒn lÃ nh máº¡nh ngÃ y cÃ ng phá»• biáº¿n, sá»¯a háº¡t Ä‘Ã£ trá»Ÿ thÃ nh lá»±a chá»n hÃ ng Ä‘áº§u cá»§a hÃ ng triá»‡u ngÆ°á»i trÃªn tháº¿ giá»›i â€“ tá»« váº­n Ä‘á»™ng viÃªn, ngÆ°á»i Äƒn chay cho Ä‘áº¿n cÃ¡c gia Ä‘Ã¬nh tráº» muá»‘n kiá»ƒm soÃ¡t sá»©c khoáº» tá»‘t hÆ¡n.</p>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">ðŸŒ¿ Sá»¯a Háº¡t LÃ  GÃ¬? Táº¡i Sao NÃ³ Äáº·c Biá»‡t?</h3>
  <p style="line-height:1.9;color:#374151;margin-bottom:20px">Sá»¯a háº¡t Ä‘Æ°á»£c sáº£n xuáº¥t báº±ng cÃ¡ch ngÃ¢m, xay vÃ  lá»c cÃ¡c loáº¡i háº¡t nhÆ° <strong>háº¡nh nhÃ¢n, háº¡t Ä‘iá»u, Ã³c chÃ³, háº¡t bÃ­, macadamia</strong>... vá»›i nÆ°á»›c tinh khiáº¿t. KhÃ´ng cÃ³ lactose, khÃ´ng cÃ³ hormone nhÃ¢n táº¡o â€“ Ä‘Ã¢y lÃ  thá»©c uá»‘ng thuáº§n thiÃªn nhiÃªn hoÃ n toÃ n.</p>

  <div style="background:linear-gradient(135deg,#f0faf1,#e8f5e9);border-left:4px solid #6B8F71;padding:24px;border-radius:12px;margin:28px 0">
    <p style="margin:0;color:#2d5a2d;font-weight:500;line-height:1.8">ðŸ’¡ <strong>Sá»± khÃ¡c biá»‡t cá»‘t lÃµi:</strong> KhÃ´ng giá»‘ng sá»¯a bÃ² cÃ´ng nghiá»‡p, sá»¯a háº¡t tá»± náº¥u <em>khÃ´ng chá»©a cháº¥t báº£o quáº£n, khÃ´ng mÃ u nhÃ¢n táº¡o</em> vÃ  nguyÃªn liá»‡u hoÃ n toÃ n kiá»ƒm soÃ¡t Ä‘Æ°á»£c tá»« nguá»“n gá»‘c Ä‘áº¿n ly uá»‘ng.</p>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">ðŸ“Š Báº£ng So SÃ¡nh Dinh DÆ°á»¡ng (Má»—i 250ml)</h3>
  <div style="overflow-x:auto;margin-bottom:28px">
    <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
      <thead>
        <tr style="background:#6B8F71;color:white">
          <th style="padding:12px 16px;text-align:left;border-radius:8px 0 0 0">Loáº¡i sá»¯a</th>
          <th style="padding:12px 16px;text-align:center">Calo</th>
          <th style="padding:12px 16px;text-align:center">Protein</th>
          <th style="padding:12px 16px;text-align:center">Cháº¥t bÃ©o</th>
          <th style="padding:12px 16px;text-align:center;border-radius:0 8px 0 0">Lactose</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background:#f9f9f9">
          <td style="padding:12px 16px;font-weight:600;color:#6B8F71">ðŸŒ° Sá»¯a Háº¡nh NhÃ¢n</td>
          <td style="padding:12px 16px;text-align:center">39 kcal</td>
          <td style="padding:12px 16px;text-align:center">1.5g</td>
          <td style="padding:12px 16px;text-align:center">3g</td>
          <td style="padding:12px 16px;text-align:center">âŒ KhÃ´ng</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-weight:600;color:#6B8F71">ðŸ¥œ Sá»¯a Háº¡t Äiá»u</td>
          <td style="padding:12px 16px;text-align:center">45 kcal</td>
          <td style="padding:12px 16px;text-align:center">1.8g</td>
          <td style="padding:12px 16px;text-align:center">3.5g</td>
          <td style="padding:12px 16px;text-align:center">âŒ KhÃ´ng</td>
        </tr>
        <tr style="background:#f9f9f9">
          <td style="padding:12px 16px;font-weight:600;color:#888">ðŸ„ Sá»¯a BÃ²</td>
          <td style="padding:12px 16px;text-align:center">149 kcal</td>
          <td style="padding:12px 16px;text-align:center">8g</td>
          <td style="padding:12px 16px;text-align:center">8g</td>
          <td style="padding:12px 16px;text-align:center">âœ… CÃ³</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">âœ… 5 LÃ½ Do ChuyÃªn Gia Dinh DÆ°á»¡ng KhuyÃªn DÃ¹ng Sá»¯a Háº¡t</h3>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px">
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px">
      <div style="font-size:2rem;margin-bottom:8px">ðŸ«€</div>
      <h4 style="color:#1a202c;margin-bottom:8px">Tá»‘t cho tim máº¡ch</h4>
      <p style="font-size:0.875rem;color:#6B7280;line-height:1.7">Axit bÃ©o khÃ´ng bÃ£o hoÃ  trong háº¡t Ä‘iá»u vÃ  háº¡nh nhÃ¢n giÃºp giáº£m LDL cholesterol â€“ yáº¿u tá»‘ nguy cÆ¡ chÃ­nh gÃ¢y bá»‡nh tim.</p>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px">
      <div style="font-size:2rem;margin-bottom:8px">âš–ï¸</div>
      <h4 style="color:#1a202c;margin-bottom:8px">Quáº£n lÃ½ cÃ¢n náº·ng</h4>
      <p style="font-size:0.875rem;color:#6B7280;line-height:1.7">Calo tháº¥p hÆ¡n sá»¯a bÃ² tá»›i 70%, phÃ¹ há»£p tÃ­ch há»£p vÃ o thá»±c Ä‘Æ¡n giáº£m cÃ¢n hoáº·c duy trÃ¬ vÃ³c dÃ¡ng lÃ½ tÆ°á»Ÿng.</p>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px">
      <div style="font-size:2rem;margin-bottom:8px">ðŸŒ±</div>
      <h4 style="color:#1a202c;margin-bottom:8px">ThÃ¢n thiá»‡n mÃ´i trÆ°á»ng</h4>
      <p style="font-size:0.875rem;color:#6B7280;line-height:1.7">Sáº£n xuáº¥t sá»¯a háº¡t tiÃªu thá»¥ Ã­t nÆ°á»›c vÃ  phÃ¡t tháº£i COâ‚‚ Ã­t hÆ¡n tá»›i 60% so vá»›i chÄƒn nuÃ´i bÃ² sá»¯a.</p>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px">
      <div style="font-size:2rem;margin-bottom:8px">ðŸ§¬</div>
      <h4 style="color:#1a202c;margin-bottom:8px">KhÃ´ng dá»‹ á»©ng lactose</h4>
      <p style="font-size:0.875rem;color:#6B7280;line-height:1.7">HoÃ n toÃ n phÃ¹ há»£p vá»›i 65% dÃ¢n sá»‘ tháº¿ giá»›i cÃ³ kháº£ nÄƒng khÃ´ng háº¥p thu lactose sau tuá»•i trÆ°á»Ÿng thÃ nh.</p>
    </div>
  </div>

  <div style="background:#1a2e1a;color:white;border-radius:16px;padding:28px;margin-top:32px">
    <h4 style="color:#a8d5a2;margin-bottom:12px">ðŸŒŸ Lá»i KhuyÃªn Tá»« Dana</h4>
    <p style="color:rgba(255,255,255,0.85);line-height:1.8;margin:0">HÃ£y báº¯t Ä‘áº§u báº±ng má»™t ly sá»¯a háº¡t tá»± nhiÃªn má»—i sÃ¡ng â€“ khÃ´ng Ä‘Æ°á»ng thÃªm, khÃ´ng cháº¥t báº£o quáº£n â€“ vÃ  cáº£m nháº­n sá»± khÃ¡c biá»‡t sau 2 tuáº§n. <strong style="color:#a8d5a2">CÆ¡ thá»ƒ báº¡n sáº½ tá»± cáº£m Æ¡n báº¡n. ðŸ’š</strong></p>
  </div>
</div>', '/cdn/products/blog_dinh_duong_1.png', 1, datetime('now', '-9 days'));

INSERT OR REPLACE INTO blogs (id, title, category, content, image_url, is_active, created_at) VALUES ('blg_dinh_duong_2', 'Háº¡nh NhÃ¢n vs Háº¡t Äiá»u: Chá»n Loáº¡i Sá»¯a Háº¡t NÃ o PhÃ¹ Há»£p Nháº¥t Vá»›i Báº¡n?', 'Dinh DÆ°á»¡ng', '<div class="blog-article">
  <img src="/cdn/products/blog_dinh_duong_2.png" alt="Sá»¯a háº¡nh nhÃ¢n thuáº§n tá»± nhiÃªn" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" />
  
  <p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Khi láº§n Ä‘áº§u tiáº¿p cáº­n vá»›i tháº¿ giá»›i sá»¯a háº¡t, cÃ¢u há»i phá»• biáº¿n nháº¥t mÃ  khÃ¡ch hÃ ng Dana thÆ°á»ng há»i lÃ : <em>"TÃ´i nÃªn chá»n háº¡nh nhÃ¢n hay háº¡t Ä‘iá»u?"</em> BÃ i viáº¿t nÃ y sáº½ giÃºp báº¡n tráº£ lá»i dá»©t khoÃ¡t cÃ¢u há»i Ä‘Ã³.</p>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">ðŸŒ° Sá»¯a Háº¡nh NhÃ¢n â€“ Thanh Tao & Nháº¹ NhÃ ng</h3>
  <p style="line-height:1.9;color:#374151;margin-bottom:20px">Háº¡nh nhÃ¢n (<em>Prunus dulcis</em>) Ä‘Æ°á»£c má»‡nh danh lÃ  "vua cá»§a cÃ¡c loáº¡i háº¡t" nhá» hÃ m lÆ°á»£ng dinh dÆ°á»¡ng vÆ°á»£t trá»™i. Sá»¯a háº¡nh nhÃ¢n cÃ³ vá»‹ nháº¹ nhÃ ng, thanh mÃ¡t â€“ lÃ½ tÆ°á»Ÿng cho nhá»¯ng ai thÃ­ch uá»‘ng khÃ´ng ngá»t.</p>
  
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:24px">
    <h4 style="color:#92400e;margin-bottom:12px">ðŸ† Háº¡nh NhÃ¢n Ná»•i Báº­t Vá»›i:</h4>
    <ul style="color:#78350f;line-height:2;margin:0;padding-left:20px">
      <li><strong>Vitamin E</strong> cao nháº¥t trong cÃ¡c loáº¡i háº¡t â€“ chá»‘ng lÃ£o hÃ³a, báº£o vá»‡ da</li>
      <li><strong>Canxi tá»± nhiÃªn</strong> â€“ há»— trá»£ xÆ°Æ¡ng cháº¯c khoáº» khÃ´ng cáº§n bá»• sung ngoÃ i</li>
      <li><strong>39 kcal/250ml</strong> â€“ tháº¥p nháº¥t trong táº¥t cáº£ cÃ¡c loáº¡i sá»¯a thá»±c váº­t</li>
      <li><strong>Magie & Phospho</strong> â€“ há»— trá»£ nÃ£o bá»™, giáº£m cÄƒng tháº³ng hiá»‡u quáº£</li>
    </ul>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">ðŸ¥œ Sá»¯a Háº¡t Äiá»u â€“ BÃ©o Ngáº­y & Äáº­m Vá»‹</h3>
  <p style="line-height:1.9;color:#374151;margin-bottom:20px">Háº¡t Ä‘iá»u (<em>Anacardium occidentale</em>) â€“ Ä‘áº·c sáº£n nhiá»‡t Ä‘á»›i Viá»‡t Nam â€“ táº¡o ra loáº¡i sá»¯a cÃ³ Ä‘á»™ sÃ¡nh bÃ©o tá»± nhiÃªn, vá»‹ ngá»t dá»‹u khÃ´ng cáº§n thÃªm Ä‘Æ°á»ng. Äáº·c biá»‡t phá»• biáº¿n trong pha cháº¿ cÃ  phÃª vÃ  lÃ m bÃ¡nh.</p>

  <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin-bottom:24px">
    <h4 style="color:#0c4a6e;margin-bottom:12px">ðŸ† Háº¡t Äiá»u Ná»•i Báº­t Vá»›i:</h4>
    <ul style="color:#075985;line-height:2;margin:0;padding-left:20px">
      <li><strong>Káº½m & Sáº¯t</strong> â€“ há»— trá»£ há»‡ miá»…n dá»‹ch vÃ  táº¡o há»“ng cáº§u</li>
      <li><strong>Texture bÃ©o ngáº­y</strong> â€“ thay tháº¿ hoÃ n háº£o cho kem sá»¯a trong Ä‘á»“ uá»‘ng</li>
      <li><strong>Tryptophan</strong> â€“ tiá»n cháº¥t serotonin, cáº£i thiá»‡n tÃ¢m tráº¡ng vÃ  giáº¥c ngá»§</li>
      <li><strong>Vá»‹ ngá»t tá»± nhiÃªn</strong> â€“ khÃ´ng cáº§n thÃªm Ä‘Æ°á»ng váº«n thÆ¡m ngon</li>
    </ul>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">ðŸŽ¯ Chá»n Loáº¡i NÃ o? â€“ Báº£ng Quyáº¿t Äá»‹nh Nhanh</h3>
  <div style="overflow-x:auto;margin-bottom:28px">
    <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
      <thead>
        <tr style="background:#6B8F71;color:white">
          <th style="padding:12px 16px;text-align:left">Náº¿u báº¡n...</th>
          <th style="padding:12px 16px;text-align:center">Chá»n</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background:#f9f9f9">
          <td style="padding:12px 16px">Muá»‘n giáº£m cÃ¢n, uá»‘ng hÃ ng ngÃ y</td>
          <td style="padding:12px 16px;text-align:center;font-weight:700;color:#6B8F71">ðŸŒ° Háº¡nh NhÃ¢n</td>
        </tr>
        <tr>
          <td style="padding:12px 16px">ThÃ­ch pha cÃ  phÃª, lÃ m bÃ¡nh, náº¥u Äƒn</td>
          <td style="padding:12px 16px;text-align:center;font-weight:700;color:#6B8F71">ðŸ¥œ Háº¡t Äiá»u</td>
        </tr>
        <tr style="background:#f9f9f9">
          <td style="padding:12px 16px">Muá»‘n chÄƒm sÃ³c da, chá»‘ng lÃ£o hÃ³a</td>
          <td style="padding:12px 16px;text-align:center;font-weight:700;color:#6B8F71">ðŸŒ° Háº¡nh NhÃ¢n</td>
        </tr>
        <tr>
          <td style="padding:12px 16px">Táº­p gym, cáº§n phá»¥c há»“i sau táº­p</td>
          <td style="padding:12px 16px;text-align:center;font-weight:700;color:#6B8F71">ðŸ¥œ Háº¡t Äiá»u</td>
        </tr>
        <tr style="background:#f9f9f9">
          <td style="padding:12px 16px">Tráº» em, ngÆ°á»i cao tuá»•i cáº§n canxi</td>
          <td style="padding:12px 16px;text-align:center;font-weight:700;color:#6B8F71">ðŸŒ° Háº¡nh NhÃ¢n</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div style="background:linear-gradient(135deg,#6B8F71,#4a7a52);color:white;border-radius:16px;padding:28px;margin-top:32px;text-align:center">
    <h4 style="color:white;margin-bottom:12px;font-size:1.2rem">ðŸ’š BÃ­ quyáº¿t cá»§a Dana</h4>
    <p style="color:rgba(255,255,255,0.9);line-height:1.8;margin:0">Äá»«ng chá»n má»™t â€“ <strong>hÃ£y dÃ¹ng xen káº½ cáº£ hai!</strong> Buá»•i sÃ¡ng: háº¡nh nhÃ¢n Ä‘á»ƒ tá»‰nh tÃ¡o nháº¹ nhÃ ng. Buá»•i tá»‘i: háº¡t Ä‘iá»u Ä‘á»ƒ thÆ° giÃ£n vÃ  ngá»§ ngon hÆ¡n.</p>
  </div>
</div>', '/cdn/products/blog_dinh_duong_2.png', 1, datetime('now', '-13 days'));

INSERT OR REPLACE INTO blogs (id, title, category, content, image_url, is_active, created_at) VALUES ('blg_cong_thuc_1', 'CÃ´ng Thá»©c LÃ m Sá»¯a Háº¡t Äiá»u Táº¡i NhÃ  Chá»‰ Trong 15 PhÃºt â€“ Ngon HÆ¡n Mua NgoÃ i', 'CÃ´ng Thá»©c', '<div class="blog-article">
  <img src="/cdn/products/blog_cong_thuc_1.png" alt="Quy trÃ¬nh lÃ m sá»¯a háº¡t táº¡i nhÃ " style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" />
  
  <p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Sá»¯a háº¡t Ä‘iá»u tá»± náº¥u cÃ³ vá»‹ ngon hÆ¡n háº³n, khÃ´ng chá»©a cháº¥t báº£o quáº£n, vÃ  báº¡n hoÃ n toÃ n kiá»ƒm soÃ¡t Ä‘Æ°á»£c Ä‘á»™ ngá»t. HÆ¡n ná»¯a, chi phÃ­ chá»‰ báº±ng 30% so vá»›i mua ngoÃ i tiá»‡m!</p>

  <div style="background:#f0faf1;border-radius:16px;padding:28px;margin-bottom:32px">
    <h3 style="color:#2d5a2d;margin-bottom:20px;font-size:1.2rem">ðŸ›’ NguyÃªn Liá»‡u (Cho 1 lÃ­t sá»¯a)</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="background:white;border-radius:10px;padding:16px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.5rem">ðŸ¥œ</span>
        <div><strong>150g háº¡t Ä‘iá»u thÃ´</strong><br><span style="font-size:0.8rem;color:#6B7280">Loáº¡i khÃ´ng rang, khÃ´ng muá»‘i</span></div>
      </div>
      <div style="background:white;border-radius:10px;padding:16px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.5rem">ðŸ’§</span>
        <div><strong>1000ml nÆ°á»›c lá»c</strong><br><span style="font-size:0.8rem;color:#6B7280">Chia thÃ nh 200ml ngÃ¢m + 800ml xay</span></div>
      </div>
      <div style="background:white;border-radius:10px;padding:16px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.5rem">ðŸ¯</span>
        <div><strong>1 muá»—ng máº­t ong</strong><br><span style="font-size:0.8rem;color:#6B7280">TÃ¹y kháº©u vá»‹, cÃ³ thá»ƒ bá» qua</span></div>
      </div>
      <div style="background:white;border-radius:10px;padding:16px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.5rem">ðŸ§‚</span>
        <div><strong>Má»™t nhÃºm muá»‘i</strong><br><span style="font-size:0.8rem;color:#6B7280">TÄƒng vá»‹, khÃ´ng báº¯t buá»™c</span></div>
      </div>
    </div>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 20px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">ðŸ“‹ CÃ¡c BÆ°á»›c Thá»±c Hiá»‡n</h3>
  
  <div style="position:relative;padding-left:32px;margin-bottom:32px">
    <div style="position:absolute;left:0;top:0;width:24px;height:24px;background:#6B8F71;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:0.75rem;font-weight:700">1</div>
    <h4 style="color:#1a202c;margin-bottom:8px">NgÃ¢m háº¡t Ä‘iá»u (4-8 tiáº¿ng hoáº·c qua Ä‘Ãªm)</h4>
    <p style="color:#374151;line-height:1.8;margin-bottom:24px">Rá»­a sáº¡ch háº¡t Ä‘iá»u, ngÃ¢m vá»›i nÆ°á»›c láº¡nh tá»‘i thiá»ƒu 4 tiáº¿ng (tá»‘t nháº¥t qua Ä‘Ãªm). Háº¡t ná»Ÿ ra sáº½ giÃºp sá»¯a má»‹n mÃ ng hÆ¡n vÃ  dá»… tiÃªu hÃ³a hÆ¡n.</p>
    
    <div style="position:absolute;left:0;top:120px;width:24px;height:24px;background:#6B8F71;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:0.75rem;font-weight:700">2</div>
    <h4 style="color:#1a202c;margin-bottom:8px;margin-top:48px">Xáº£ nÆ°á»›c ngÃ¢m, xay vá»›i nÆ°á»›c má»›i</h4>
    <p style="color:#374151;line-height:1.8;margin-bottom:24px">Xáº£ bá» nÆ°á»›c ngÃ¢m (Ä‘Ã¢y lÃ  nÆ°á»›c cÃ³ chá»©a enzyme á»©c cháº¿ tiÃªu hÃ³a). Cho háº¡t vÃ o mÃ¡y xay cÃ¹ng 800ml nÆ°á»›c sáº¡ch. Xay á»Ÿ tá»‘c Ä‘á»™ cao trong <strong>90 giÃ¢y</strong> Ä‘á»ƒ há»—n há»£p tháº­t má»‹n.</p>
    
    <div style="position:absolute;left:0;top:280px;width:24px;height:24px;background:#6B8F71;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:0.75rem;font-weight:700">3</div>
    <h4 style="color:#1a202c;margin-bottom:8px;margin-top:48px">Lá»c qua váº£i cheesecloth (TÃ¹y chá»n)</h4>
    <p style="color:#374151;line-height:1.8;margin-bottom:24px">Äáº·t váº£i lá»c trÃªn tÃ´ lá»›n, Ä‘á»• há»—n há»£p vÃ o vÃ  váº¯t nháº¹. Pháº§n bÃ£ háº¡t Ä‘iá»u cÃ²n láº¡i cÃ³ thá»ƒ dÃ¹ng lÃ m bÃ¡nh hoáº·c thÃªm vÃ o chÃ¡o. <em>LÆ°u Ã½: Sá»¯a háº¡t Ä‘iá»u khÃ´ng nháº¥t thiáº¿t pháº£i lá»c vÃ¬ háº¡t má»‹n hÆ¡n háº¡nh nhÃ¢n.</em></p>
    
    <div style="position:absolute;left:0;top:460px;width:24px;height:24px;background:#6B8F71;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:0.75rem;font-weight:700">4</div>
    <h4 style="color:#1a202c;margin-bottom:8px;margin-top:48px">NÃªm vá»‹ vÃ  báº£o quáº£n</h4>
    <p style="color:#374151;line-height:1.8;margin-bottom:24px">ThÃªm máº­t ong vÃ  muá»‘i, khuáº¥y Ä‘á»u. Äá»• vÃ o chai thá»§y tinh cÃ³ náº¯p, báº£o quáº£n trong tá»§ láº¡nh dÃ¹ng trong vÃ²ng <strong>3-5 ngÃ y</strong>. Láº¯c Ä‘á»u trÆ°á»›c khi uá»‘ng vÃ¬ sá»¯a tá»± nhiÃªn sáº½ tÃ¡ch lá»›p.</p>
  </div>

  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:24px;margin:32px 0">
    <h4 style="color:#92400e;margin-bottom:12px">â­ Máº¹o Cá»§a Dana Äá»ƒ Sá»¯a Ngon HÆ¡n:</h4>
    <ul style="color:#78350f;line-height:2;margin:0;padding-left:20px">
      <li>ThÃªm <strong>1 quáº£ chÃ  lÃ  khÃ´</strong> khi xay thay cho Ä‘Æ°á»ng â€“ ngá»t tá»± nhiÃªn, giÃ u dinh dÆ°á»¡ng</li>
      <li>ThÃªm <strong>1/4 muá»—ng vani extract</strong> Ä‘á»ƒ sá»¯a thÆ¡m nhÆ° kem Ã½ vá»‹</li>
      <li>Xay vá»›i <strong>nÆ°á»›c áº¥m 40Â°C</strong> â€“ sá»¯a ra má»‹n hÆ¡n nÆ°á»›c láº¡nh</li>
      <li>DÃ¹ng mÃ¡y xay <strong>Vitamix hoáº·c Blendtec</strong> sáº½ cho káº¿t quáº£ tá»‘t nháº¥t</li>
    </ul>
  </div>

  <div style="background:#1a2e1a;color:white;border-radius:16px;padding:28px;margin-top:32px">
    <p style="color:rgba(255,255,255,0.9);line-height:1.8;margin:0;text-align:center">ðŸŒ± <strong style="color:#a8d5a2">Má»™t máº» sá»¯a = 10 phÃºt pha cháº¿ + 5 phÃºt chuáº©n bá»‹.</strong> Báº¡n sáº½ khÃ´ng bao giá» muá»‘n mua sá»¯a há»™p ná»¯a sau khi thá»­ recipe nÃ y!</p>
  </div>
</div>', '/cdn/products/blog_cong_thuc_1.png', 1, datetime('now', '-5 days'));

INSERT OR REPLACE INTO blogs (id, title, category, content, image_url, is_active, created_at) VALUES ('blg_cong_thuc_2', 'Smoothie Bowl Sá»¯a Háº¡t 5 MÃ u â€“ Bá»¯a SÃ¡ng Vá»«a Äáº¹p Vá»«a Dinh DÆ°á»¡ng Trong 10 PhÃºt', 'CÃ´ng Thá»©c', '<div class="blog-article">
  <img src="/cdn/products/blog_cong_thuc_2.png" alt="Smoothie Bowl mÃ u sáº¯c vá»›i sá»¯a háº¡t" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" />
  
  <p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Náº¿u báº¡n Ä‘ang tÃ¬m kiáº¿m má»™t bá»¯a sÃ¡ng vá»«a instagram-worthy, vá»«a cung cáº¥p Ä‘á»§ nÄƒng lÆ°á»£ng cho má»™t ngÃ y dÃ i â€“ thÃ¬ Smoothie Bowl Sá»¯a Háº¡t 5 MÃ u chÃ­nh lÃ  cÃ¢u tráº£ lá»i!</p>

  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:32px;text-align:center">
    <div style="background:#fce7f3;border-radius:12px;padding:16px">
      <div style="font-size:1.5rem">ðŸ‰</div>
      <div style="font-size:0.75rem;color:#be185d;font-weight:600;margin-top:4px">Thanh Long</div>
    </div>
    <div style="background:#fef3c7;border-radius:12px;padding:16px">
      <div style="font-size:1.5rem">ðŸ¥­</div>
      <div style="font-size:0.75rem;color:#d97706;font-weight:600;margin-top:4px">XoÃ i</div>
    </div>
    <div style="background:#ede9fe;border-radius:12px;padding:16px">
      <div style="font-size:1.5rem">ðŸ«</div>
      <div style="font-size:0.75rem;color:#7c3aed;font-weight:600;margin-top:4px">Viá»‡t Quáº¥t</div>
    </div>
    <div style="background:#dcfce7;border-radius:12px;padding:16px">
      <div style="font-size:1.5rem">ðŸ¥</div>
      <div style="font-size:0.75rem;color:#16a34a;font-weight:600;margin-top:4px">Kiwi</div>
    </div>
    <div style="background:#fff1f2;border-radius:12px;padding:16px">
      <div style="font-size:1.5rem">ðŸ“</div>
      <div style="font-size:0.75rem;color:#e11d48;font-weight:600;margin-top:4px">DÃ¢u TÃ¢y</div>
    </div>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">ðŸ›’ NguyÃªn Liá»‡u (1 NgÆ°á»i)</h3>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px">
    <div>
      <h4 style="color:#6B8F71;margin-bottom:12px">Pháº§n Blend:</h4>
      <ul style="line-height:2;color:#374151;padding-left:20px;margin:0">
        <li>150ml <strong>Sá»¯a Háº¡t Dana</strong> (háº¡nh nhÃ¢n hoáº·c Ä‘iá»u)</li>
        <li>1 quáº£ chuá»‘i Ä‘Ã´ng láº¡nh</li>
        <li>100g há»—n há»£p trÃ¡i cÃ¢y Ä‘Ã´ng láº¡nh</li>
        <li>1 muá»—ng bÆ¡ háº¡t Ä‘iá»u</li>
        <li>ÄÃ¡ viÃªn vá»«a Ä‘á»§</li>
      </ul>
    </div>
    <div>
      <h4 style="color:#6B8F71;margin-bottom:12px">Topping Trang TrÃ­:</h4>
      <ul style="line-height:2;color:#374151;padding-left:20px;margin:0">
        <li>Hoa quáº£ tÆ°Æ¡i theo sá»Ÿ thÃ­ch</li>
        <li>Granola giÃ²n 2 muá»—ng</li>
        <li>Háº¡t chia 1 muá»—ng</li>
        <li>Máº­t ong Ä‘á»ƒ rÆ°á»›i</li>
        <li>LÃ¡ báº¡c hÃ  trang trÃ­</li>
      </ul>
    </div>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">âš¡ Thá»±c Hiá»‡n Cá»±c Nhanh â€“ 10 PhÃºt</h3>
  
  <div style="display:flex;flex-direction:column;gap:16px;margin-bottom:28px">
    <div style="display:flex;gap:16px;align-items:flex-start;background:#f9fafb;border-radius:12px;padding:16px">
      <div style="background:#6B8F71;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">1</div>
      <div>
        <strong>Blend pháº§n kem ná»n</strong> â€“ Cho táº¥t cáº£ nguyÃªn liá»‡u blend vÃ o mÃ¡y xay, xay á»Ÿ tá»‘c Ä‘á»™ cao Ä‘áº¿n khi há»—n há»£p má»‹n Ä‘áº·c nhÆ° kem. <em>LÆ°u Ã½: KhÃ´ng thÃªm quÃ¡ nhiá»u nÆ°á»›c â€“ bowl pháº£i Ä‘áº·c Ä‘á»ƒ topping khÃ´ng chÃ¬m.</em>
      </div>
    </div>
    <div style="display:flex;gap:16px;align-items:flex-start;background:#f9fafb;border-radius:12px;padding:16px">
      <div style="background:#6B8F71;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">2</div>
      <div>
        <strong>Äá»• vÃ o tÃ´ rá»“i trang trÃ­ ngay</strong> â€“ Chia máº·t tÃ´ thÃ nh 5 khu vá»±c theo mÃ u trÃ¡i cÃ¢y. Xáº¿p granola thÃ nh dáº£i, ráº¯c háº¡t chia Ä‘á»u, rÆ°á»›i máº­t ong theo Ä‘Æ°á»ng zigzag.
      </div>
    </div>
    <div style="display:flex;gap:16px;align-items:flex-start;background:#f9fafb;border-radius:12px;padding:16px">
      <div style="background:#6B8F71;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">3</div>
      <div>
        <strong>Ä‚n ngay!</strong> â€“ Smoothie Bowl ngon nháº¥t khi Äƒn trong vÃ²ng 5 phÃºt sau khi lÃ m xong Ä‘á»ƒ topping cÃ²n giÃ²n vÃ  mÃ u sáº¯c cÃ²n tÆ°Æ¡i.
      </div>
    </div>
  </div>

  <div style="background:linear-gradient(135deg,#fce7f3,#ede9fe,#dcfce7);border-radius:16px;padding:24px;margin:32px 0">
    <h4 style="color:#1a202c;margin-bottom:12px">ðŸ“¸ Máº¹o Chá»¥p áº¢nh Äáº¹p Cho Instagram:</h4>
    <ul style="color:#374151;line-height:1.9;margin:0;padding-left:20px">
      <li>Chá»¥p tá»« gÃ³c <strong>90Â° tá»« trÃªn xuá»‘ng (flat lay)</strong></li>
      <li>DÃ¹ng tÃ´ <strong>mÃ u tráº¯ng hoáº·c Ä‘en</strong> Ä‘á»ƒ lÃ m ná»•i mÃ u topping</li>
      <li>Chá»¥p gáº§n cá»­a sá»• Ä‘á»ƒ cÃ³ <strong>Ã¡nh sÃ¡ng tá»± nhiÃªn Ä‘áº¹p</strong></li>
      <li>ThÃªm 1-2 nguyÃªn liá»‡u ráº£i xung quanh tÃ´ Ä‘á»ƒ cÃ³ <strong>context</strong></li>
    </ul>
  </div>

  <p style="font-size:1rem;line-height:1.9;color:#374151;background:#f0faf1;border-radius:12px;padding:20px">ðŸŒ± <strong>GiÃ¡ trá»‹ dinh dÆ°á»¡ng Æ°á»›c tÃ­nh:</strong> ~320 kcal | 8g protein | 52g carbs | 12g fat (cháº¥t bÃ©o lÃ nh máº¡nh) â€“ Äá»§ no Ä‘áº¿n táº­n trÆ°a!</p>
</div>', '/cdn/products/blog_cong_thuc_2.png', 1, datetime('now', '-28 days'));

INSERT OR REPLACE INTO blogs (id, title, category, content, image_url, is_active, created_at) VALUES ('blg_fitness_1', 'Sá»¯a Háº¡t VÃ  Thá»ƒ HÃ¬nh: BÃ­ KÃ­p Phá»¥c Há»“i Sau Táº­p Luyá»‡n Cá»§a CÃ¡c Váº­n Äá»™ng ViÃªn', 'Fitness', '<div class="blog-article">
  <img src="/cdn/products/blog_fitness_1.png" alt="Váº­n Ä‘á»™ng viÃªn uá»‘ng sá»¯a háº¡t sau táº­p gym" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" />
  
  <p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">35 phÃºt sau khi táº­p luyá»‡n cÆ°á»ng Ä‘á»™ cao lÃ  "<strong>cá»­a sá»• vÃ ng</strong>" â€“ giai Ä‘oáº¡n cÆ¡ thá»ƒ háº¥p thá»¥ dinh dÆ°á»¡ng hiá»‡u quáº£ nháº¥t Ä‘á»ƒ tÃ¡i táº¡o vÃ  phÃ¡t triá»ƒn cÆ¡ báº¯p. Sá»¯a háº¡t cÃ³ thá»ƒ lÃ  Ä‘á»“ng minh hoÃ n háº£o trong giai Ä‘oáº¡n nÃ y náº¿u báº¡n biáº¿t cÃ¡ch dÃ¹ng Ä‘Ãºng.</p>

  <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:white;border-radius:16px;padding:28px;margin-bottom:32px">
    <h3 style="color:#a8d5a2;margin-bottom:16px">âš¡ "Cá»­a Sá»• VÃ ng" Sau Táº­p â€“ Khoa Há»c NÃ³i GÃ¬?</h3>
    <p style="color:rgba(255,255,255,0.85);line-height:1.9;margin:0">Trong 30-45 phÃºt sau buá»•i táº­p, enzyme <em>glycogen synthase</em> hoáº¡t Ä‘á»™ng tá»‘i Ä‘a, giÃºp cÆ¡ thá»ƒ chuyá»ƒn hÃ³a glucose thÃ nh glycogen cÆ¡ nhanh gáº¥p 3-4 láº§n bÃ¬nh thÆ°á»ng. ÄÃ¢y lÃ  lÃ½ do báº¡n cáº§n náº¡p Ä‘Ãºng loáº¡i dinh dÆ°á»¡ng vÃ o Ä‘Ãºng thá»i Ä‘iá»ƒm.</p>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">ðŸ‹ï¸ Táº¡i Sao Sá»¯a Háº¡t Láº¡i PhÃ¹ Há»£p Sau Táº­p?</h3>
  
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:28px">
    <div style="background:#f0faf1;border-radius:12px;padding:20px;text-align:center">
      <div style="font-size:2.5rem;margin-bottom:8px">ðŸ«€</div>
      <h4 style="color:#2d5a2d;margin-bottom:8px;font-size:0.95rem">Chá»‘ng ViÃªm Nhanh</h4>
      <p style="font-size:0.8rem;color:#374151;margin:0;line-height:1.7">Omega-6 trong háº¡t Ä‘iá»u giáº£m viÃªm cÆ¡ báº¯p sau váº­n Ä‘á»™ng cao Ä‘á»™</p>
    </div>
    <div style="background:#f0faf1;border-radius:12px;padding:20px;text-align:center">
      <div style="font-size:2.5rem;margin-bottom:8px">âš¡</div>
      <h4 style="color:#2d5a2d;margin-bottom:8px;font-size:0.95rem">Náº¡p NÄƒng LÆ°á»£ng</h4>
      <p style="font-size:0.8rem;color:#374151;margin:0;line-height:1.7">Carb tá»± nhiÃªn tá»« háº¡t giÃºp tÃ¡i táº¡o glycogen Ä‘Ã£ tiÃªu hao khi táº­p</p>
    </div>
    <div style="background:#f0faf1;border-radius:12px;padding:20px;text-align:center">
      <div style="font-size:2.5rem;margin-bottom:8px">ðŸ’§</div>
      <h4 style="color:#2d5a2d;margin-bottom:8px;font-size:0.95rem">BÃ¹ Äiá»‡n Giáº£i</h4>
      <p style="font-size:0.8rem;color:#374151;margin:0;line-height:1.7">Kali, Magie, Canxi trong sá»¯a háº¡t bÃ¹ khoÃ¡ng cháº¥t máº¥t qua má»“ hÃ´i</p>
    </div>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">ðŸ¥¤ CÃ´ng Thá»©c Protein Shake Cho Tá»«ng Má»¥c TiÃªu</h3>
  
  <div style="display:flex;flex-direction:column;gap:20px;margin-bottom:28px">
    <div style="border:2px solid #6B8F71;border-radius:16px;padding:24px">
      <h4 style="color:#6B8F71;margin-bottom:12px">ðŸ’ª Má»¥c TiÃªu: TÄƒng CÆ¡ (Bulking)</h4>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">
        <span style="background:#e8f5e9;color:#2d5a2d;padding:4px 12px;border-radius:20px;font-size:0.85rem">300ml Sá»¯a Háº¡t</span>
        <span style="background:#e8f5e9;color:#2d5a2d;padding:4px 12px;border-radius:20px;font-size:0.85rem">1 scoop Whey Protein</span>
        <span style="background:#e8f5e9;color:#2d5a2d;padding:4px 12px;border-radius:20px;font-size:0.85rem">1 quáº£ chuá»‘i</span>
        <span style="background:#e8f5e9;color:#2d5a2d;padding:4px 12px;border-radius:20px;font-size:0.85rem">2 muá»—ng bÆ¡ Ä‘áº­u phá»™ng</span>
      </div>
      <p style="font-size:0.85rem;color:#374151;margin:0">~550 kcal | 35g Protein | 60g Carbs</p>
    </div>
    
    <div style="border:2px solid #38bdf8;border-radius:16px;padding:24px">
      <h4 style="color:#0284c7;margin-bottom:12px">ðŸ”¥ Má»¥c TiÃªu: Äá»‘t Má»¡ (Cutting)</h4>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">
        <span style="background:#e0f2fe;color:#0369a1;padding:4px 12px;border-radius:20px;font-size:0.85rem">250ml Sá»¯a Háº¡nh NhÃ¢n</span>
        <span style="background:#e0f2fe;color:#0369a1;padding:4px 12px;border-radius:20px;font-size:0.85rem">1 scoop Protein Isolate</span>
        <span style="background:#e0f2fe;color:#0369a1;padding:4px 12px;border-radius:20px;font-size:0.85rem">1/2 quáº£ bÆ¡</span>
        <span style="background:#e0f2fe;color:#0369a1;padding:4px 12px;border-radius:20px;font-size:0.85rem">ÄÃ¡ viÃªn</span>
      </div>
      <p style="font-size:0.85rem;color:#374151;margin:0">~320 kcal | 30g Protein | 15g Carbs</p>
    </div>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">ðŸ“… Lá»‹ch Uá»‘ng Sá»¯a Háº¡t Cho NgÆ°á»i Táº­p Gym</h3>
  <div style="overflow-x:auto;margin-bottom:28px">
    <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
      <thead>
        <tr style="background:#1a2e1a;color:white">
          <th style="padding:12px 16px;text-align:left">Thá»i Äiá»ƒm</th>
          <th style="padding:12px 16px;text-align:center">LÆ°á»£ng</th>
          <th style="padding:12px 16px;text-align:center">Má»¥c ÄÃ­ch</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background:#f9f9f9">
          <td style="padding:12px 16px;font-weight:600">ðŸŒ… Buá»•i sÃ¡ng (trÆ°á»›c táº­p 1h)</td>
          <td style="padding:12px 16px;text-align:center">200ml</td>
          <td style="padding:12px 16px;text-align:center">Cung cáº¥p nÄƒng lÆ°á»£ng bá»n dÃ i</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-weight:600">âš¡ Ngay sau táº­p (30 phÃºt)</td>
          <td style="padding:12px 16px;text-align:center">300ml + Protein</td>
          <td style="padding:12px 16px;text-align:center">TÃ¡i táº¡o cÆ¡ & glycogen</td>
        </tr>
        <tr style="background:#f9f9f9">
          <td style="padding:12px 16px;font-weight:600">ðŸŒ™ TrÆ°á»›c khi ngá»§</td>
          <td style="padding:12px 16px;text-align:center">150ml</td>
          <td style="padding:12px 16px;text-align:center">Cung cáº¥p amino acid qua Ä‘Ãªm</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:white;border-radius:16px;padding:28px;margin-top:32px;text-align:center">
    <h4 style="color:#a8d5a2;margin-bottom:12px">ðŸ’š Dana Káº¿t Luáº­n</h4>
    <p style="color:rgba(255,255,255,0.85);line-height:1.8;margin:0">Sá»¯a háº¡t khÃ´ng thay tháº¿ protein shake hoÃ n toÃ n, nhÆ°ng lÃ  <strong style="color:#a8d5a2">ná»n táº£ng dinh dÆ°á»¡ng lÃ nh máº¡nh</strong> giÃºp cÆ¡ thá»ƒ táº­n dá»¥ng tá»‘i Ä‘a protein bá»• sung vÃ  phá»¥c há»“i nhanh hÆ¡n sau má»—i buá»•i táº­p.</p>
  </div>
</div>', '/cdn/products/blog_fitness_1.png', 1, datetime('now', '-7 days'));

INSERT OR REPLACE INTO blogs (id, title, category, content, image_url, is_active, created_at) VALUES ('blg_gia_dinh_1', 'Sá»¯a Háº¡t Cho Cáº£ Gia ÄÃ¬nh: Tá»« Em BÃ© Äáº¿n Ã”ng BÃ  â€“ Ai CÅ©ng Uá»‘ng ÄÆ°á»£c!', 'Gia ÄÃ¬nh', '<div class="blog-article">
  <img src="/cdn/products/blog_gia_dinh_1.png" alt="Gia Ä‘Ã¬nh háº¡nh phÃºc dÃ¹ng bá»¯a sÃ¡ng cÃ¹ng sá»¯a háº¡t" style="width:100%;border-radius:16px;margin-bottom:32px;object-fit:cover;max-height:400px" />
  
  <p style="font-size:1.1rem;line-height:1.9;color:#374151;margin-bottom:24px">Má»™t sáº£n pháº©m tá»‘t cho má»i thÃ nh viÃªn trong gia Ä‘Ã¬nh â€“ Ä‘Ã³ lÃ  giÃ¡ trá»‹ cá»‘t lÃµi mÃ  Sá»¯a Háº¡t Dana mang láº¡i. Tá»« bÃ© 2 tuá»•i Ä‘ang phÃ¡t triá»ƒn Ä‘áº¿n Ã´ng bÃ  cáº§n cháº¿ Ä‘á»™ dinh dÆ°á»¡ng Ä‘áº·c biá»‡t, sá»¯a háº¡t Ä‘á»u cÃ³ thá»ƒ Ä‘á»“ng hÃ nh.</p>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px">
    <div style="background:linear-gradient(135deg,#fce7f3,#fbcfe8);border-radius:16px;padding:24px">
      <div style="font-size:2rem;margin-bottom:8px">ðŸ‘¶</div>
      <h3 style="color:#be185d;margin-bottom:12px">Em BÃ© & Tráº» Nhá» (2-10 tuá»•i)</h3>
      <p style="color:#9d174d;line-height:1.8;font-size:0.9rem">Tráº» trÃªn 2 tuá»•i cÃ³ thá»ƒ uá»‘ng sá»¯a háº¡t nhÆ° thá»©c uá»‘ng phá»¥ bÃªn cáº¡nh sá»¯a máº¹ hoáº·c sá»¯a cÃ´ng thá»©c. <strong>KhÃ´ng nÃªn dÃ¹ng lÃ m sá»¯a chÃ­nh</strong> trÆ°á»›c 2 tuá»•i.</p>
      <div style="background:rgba(255,255,255,0.7);border-radius:10px;padding:12px;margin-top:12px">
        <p style="font-size:0.8rem;color:#9d174d;margin:0;font-weight:600">âœ… PhÃ¹ há»£p:</p>
        <ul style="font-size:0.8rem;color:#9d174d;margin:4px 0 0;padding-left:16px;line-height:1.8">
          <li>Tráº» khÃ´ng dung náº¡p Ä‘Æ°á»£c lactose</li>
          <li>Bá»• sung trÆ°á»›c/sau bá»¯a Äƒn</li>
          <li>Pha sinh tá»‘ hoa quáº£ cho bÃ©</li>
        </ul>
      </div>
    </div>
    
    <div style="background:linear-gradient(135deg,#dbeafe,#bfdbfe);border-radius:16px;padding:24px">
      <div style="font-size:2rem;margin-bottom:8px">ðŸ§‘</div>
      <h3 style="color:#1d4ed8;margin-bottom:12px">Thanh Thiáº¿u NiÃªn (10-25 tuá»•i)</h3>
      <p style="color:#1e40af;line-height:1.8;font-size:0.9rem">Giai Ä‘oáº¡n phÃ¡t triá»ƒn xÆ°Æ¡ng vÃ  cÆ¡ báº¯p máº¡nh nháº¥t. Sá»¯a háº¡nt cung cáº¥p canxi, magie, vÃ  vitamin E há»— trá»£ tÄƒng trÆ°á»Ÿng chiá»u cao vÃ  trÃ­ nÃ£o.</p>
      <div style="background:rgba(255,255,255,0.7);border-radius:10px;padding:12px;margin-top:12px">
        <p style="font-size:0.8rem;color:#1e40af;margin:0;font-weight:600">âœ… PhÃ¹ há»£p:</p>
        <ul style="font-size:0.8rem;color:#1e40af;margin:4px 0 0;padding-left:16px;line-height:1.8">
          <li>Uá»‘ng sau táº­p thá»ƒ thao, gym</li>
          <li>Giáº£m má»¥n/má»¥n trá»©ng cÃ¡ (khÃ´ng hormone)</li>
          <li>Táº­p trung há»c táº­p nhá» Omega-9</li>
        </ul>
      </div>
    </div>
    
    <div style="background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-radius:16px;padding:24px">
      <div style="font-size:2rem;margin-bottom:8px">ðŸ‘©</div>
      <h3 style="color:#065f46;margin-bottom:12px">NgÆ°á»i Lá»›n & Phá»¥ Ná»¯ (25-50 tuá»•i)</h3>
      <p style="color:#047857;line-height:1.8;font-size:0.9rem">Phá»¥ ná»¯ Ä‘áº·c biá»‡t Ä‘Æ°á»£c lá»£i tá»« sá»¯a háº¡nh nhÃ¢n nhá» vitamin E chá»‘ng lÃ£o hÃ³a vÃ  magie há»— trá»£ chu ká»³ kinh nguyá»‡t Ä‘á»u Ä‘áº·n.</p>
      <div style="background:rgba(255,255,255,0.7);border-radius:10px;padding:12px;margin-top:12px">
        <p style="font-size:0.8rem;color:#047857;margin:0;font-weight:600">âœ… PhÃ¹ há»£p:</p>
        <ul style="font-size:0.8rem;color:#047857;margin:4px 0 0;padding-left:16px;line-height:1.8">
          <li>Phá»¥ ná»¯ mang thai (tham kháº£o bÃ¡c sÄ©)</li>
          <li>Quáº£n lÃ½ cÃ¢n náº·ng sau sinh</li>
          <li>Báº£o vá»‡ da vÃ  tÃ³c tá»« bÃªn trong</li>
        </ul>
      </div>
    </div>
    
    <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:16px;padding:24px">
      <div style="font-size:2rem;margin-bottom:8px">ðŸ‘´</div>
      <h3 style="color:#92400e;margin-bottom:12px">NgÆ°á»i Cao Tuá»•i (50+ tuá»•i)</h3>
      <p style="color:#78350f;line-height:1.8;font-size:0.9rem">NgÆ°á»i lá»›n tuá»•i thÆ°á»ng máº¥t kháº£ nÄƒng tiÃªu hÃ³a lactose. Sá»¯a háº¡t nháº¹ nhÃ ng hÆ¡n, dá»… háº¥p thá»¥ vÃ  khÃ´ng gÃ¢y Ä‘áº§y bá»¥ng.</p>
      <div style="background:rgba(255,255,255,0.7);border-radius:10px;padding:12px;margin-top:12px">
        <p style="font-size:0.8rem;color:#78350f;margin:0;font-weight:600">âœ… PhÃ¹ há»£p:</p>
        <ul style="font-size:0.8rem;color:#78350f;margin:4px 0 0;padding-left:16px;line-height:1.8">
          <li>NgÆ°á»i tiá»ƒu Ä‘Æ°á»ng (khÃ´ng Ä‘Æ°á»ng)</li>
          <li>Há»— trá»£ khá»›p xÆ°Æ¡ng (Canxi háº¡nh nhÃ¢n)</li>
          <li>Giáº£m cholesterol tim máº¡ch</li>
        </ul>
      </div>
    </div>
  </div>

  <h3 style="font-size:1.4rem;color:#1a202c;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #e8f0ea">ðŸ“‹ LÆ°u Ã Quan Trá»ng TrÆ°á»›c Khi Cho Tráº» Uá»‘ng</h3>
  <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;padding:24px;margin-bottom:28px">
    <ul style="color:#9f1239;line-height:2;margin:0;padding-left:20px">
      <li><strong>KhÃ´ng dÃ¹ng cho tráº» dÆ°á»›i 1 tuá»•i</strong> vÃ¬ chÆ°a phÃ¹ há»£p há»‡ tiÃªu hÃ³a non ná»›t</li>
      <li><strong>Kiá»ƒm tra dá»‹ á»©ng háº¡t</strong> â€“ Cho bÃ© thá»­ lÆ°á»£ng nhá» Ä‘áº§u tiÃªn vÃ  quan sÃ¡t 24 giá»</li>
      <li><strong>KhÃ´ng thay tháº¿ 100% sá»¯a máº¹/sá»¯a cÃ´ng thá»©c</strong> cho tráº» dÆ°á»›i 2 tuá»•i</li>
      <li><strong>Chá»n loáº¡i khÃ´ng Ä‘Æ°á»ng</strong> Ä‘á»ƒ trÃ¡nh hÃ¬nh thÃ nh thÃ³i quen Äƒn ngá»t sá»›m</li>
    </ul>
  </div>

  <div style="background:linear-gradient(135deg,#6B8F71,#4a7a52);color:white;border-radius:16px;padding:28px;margin-top:32px">
    <h4 style="color:#d4edda;margin-bottom:16px;font-size:1.1rem">ðŸ¡ Routine SÃ¡ng Cá»§a Gia ÄÃ¬nh LÃ nh Máº¡nh</h4>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:16px">
        <p style="color:#d4edda;font-size:0.85rem;margin:0"><strong>BÃ© nhá»:</strong> 100ml sá»¯a háº¡nh nhÃ¢n pha áº¥m + bá»¯a Äƒn sÃ¡ng nháº¹</p>
      </div>
      <div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:16px">
        <p style="color:#d4edda;font-size:0.85rem;margin:0"><strong>BÃ© lá»›n/teens:</strong> Smoothie sá»¯a háº¡t + trÃ¡i cÃ¢y trÆ°á»›c giá» Ä‘áº¿n trÆ°á»ng</p>
      </div>
      <div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:16px">
        <p style="color:#d4edda;font-size:0.85rem;margin:0"><strong>Bá»‘/Máº¹:</strong> CÃ  phÃª sá»¯a háº¡t Ä‘iá»u + granola Äƒn kÃ¨m</p>
      </div>
      <div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:16px">
        <p style="color:#d4edda;font-size:0.85rem;margin:0"><strong>Ã”ng/BÃ :</strong> 200ml sá»¯a háº¡nh nhÃ¢n áº¥m nháº¹ khÃ´ng Ä‘Æ°á»ng</p>
      </div>
    </div>
  </div>
</div>', '/cdn/products/blog_gia_dinh_1.png', 1, datetime('now', '-10 days'));
