-- ===================================================
-- SỮA HẠT DANA - Seed Data (Dữ liệu mẫu)
-- Chạy file này SAU KHI đã chạy schema.sql
-- ===================================================

-- Tạo tài khoản Admin mặc định
-- Password: DanaAdmin@2026 (SHA-256 hashed)
-- QUAN TRỌNG: Đổi mật khẩu này ngay sau khi đăng nhập lần đầu!
INSERT OR IGNORE INTO users (id, name, email, password_hash, phone, role) VALUES
('admin_001', 'Admin Dana', 'admin@hnguyenworks.id.vn', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '0974445624', 'admin');

-- Sản phẩm mẫu (6 sản phẩm)
INSERT OR IGNORE INTO products (id, name, description, price, original_price, category, image_url, badge, tags) VALUES
('sp001', 'Sữa Hạnh Nhân Nguyên Chất', 'Vị béo ngậy dịu ngọt từ hạnh nhân rang sơ, không thêm đường, giàu Vitamin E và Magie.', 85000, 100000, 'hanh-nhan', 'assets/images/products/almond.png', 'Bán chạy', '["Ít đường","Giàu Vitamin E"]'),
('sp002', 'Sữa Hạt Điều Rang Muối', 'Kết cấu mịn màng, vị béo đặc trưng từ hạt điều rang nhẹ. Thích hợp pha cà phê hoặc smoothie.', 90000, NULL, 'hat-dieu', 'assets/images/products/cashew.png', 'Mới', '["Béo lành mạnh","Creamy"]'),
('sp003', 'Sữa Óc Chó Mật Ong', 'Kết hợp óc chó giàu Omega-3 và mật ong rừng nguyên chất, hỗ trợ sức khỏe não bộ và trí nhớ.', 95000, NULL, 'oc-cho', 'assets/images/products/walnut.png', NULL, '["Omega-3","Tốt cho não"]'),
('sp004', 'Sữa Hạt Sen Tươi', 'Hương sen thanh khiết, vị ngọt dịu tự nhiên, giúp an thần, ngủ ngon và dưỡng tâm.', 88000, NULL, 'hat-sen', 'assets/images/products/lotus.png', 'Thanh mát', '["Dưỡng thần kinh","Dịu nhẹ"]'),
('sp005', 'Sữa Yến Mạch Vani', 'Giàu Beta-glucan giúp no lâu, kiểm soát đường huyết. Hương vani tự nhiên dịu dàng.', 75000, NULL, 'yen-mach', 'assets/images/products/oat.png', NULL, '["Chất xơ cao","No bền"]'),
('sp_combo01', 'Combo Thử Nghiệm 5 Chai', 'Trọn bộ 5 loại sữa hạt đặc trưng. Lựa chọn hoàn hảo cho lần đầu trải nghiệm Dana.', 380000, 475000, 'combo', 'assets/images/products/almond.png', 'Ưu đãi', '["Tiết kiệm 20%","5 vị"]');
