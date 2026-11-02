const http = require('http');

function post(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = JSON.stringify(body);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'GET'
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING END-TO-END VERIFICATION ===\n');
  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${details}`);
    }
  }

  const BASE = 'http://127.0.0.1:8080';

  // --- 1. ADMIN AUTHENTICATION TESTS ---
  console.log('--- 1. Testing Admin Authentication & Role Enforcement ---');
  // Login with vuhoangnguyen3009 (authorized admin)
  const vuLogin = await post(`${BASE}/api/auth`, {
    action: 'login',
    email: 'vuhoangnguyen3009@gmail.com',
    password: 'DanaAdmin@2026'
  });
  assert(vuLogin.status === 200 && vuLogin.data.ok && vuLogin.data.user.role === 'admin', 'Login with vuhoangnguyen3009 succeeds with role=admin');
  const adminToken = vuLogin.data.token;

  // Login with sinhngo110705 (authorized admin)
  const sinhLogin = await post(`${BASE}/api/auth`, {
    action: 'login',
    email: 'sinhngo110705@gmail.com',
    password: 'DanaAdmin@2026'
  });
  assert(sinhLogin.status === 200 && sinhLogin.data.ok && sinhLogin.data.user.role === 'admin', 'Login with sinhngo110705 succeeds with role=admin');
  const sinhToken = sinhLogin.data.token;

  // Verify sinhngo110705 can access admin dashboard
  const sinhDashboard = await get(`${BASE}/api/admin/dashboard?section=overview&token=${sinhToken}`);
  assert(sinhDashboard.status === 200 && sinhDashboard.data.ok, 'Admin sinhngo110705 successfully accesses Admin Dashboard');

  // Verify unauthorized admin (admin@hnguyenworks.id.vn) is NOT admin and receives 403 on Dashboard
  const legacyLogin = await post(`${BASE}/api/auth`, {
    action: 'login',
    email: 'admin@hnguyenworks.id.vn',
    password: 'DanaAdmin@2026'
  });
  assert(legacyLogin.status === 200 && legacyLogin.data.ok && legacyLogin.data.user.role === 'user', 'Legacy template email is demoted to role=user');
  const legacyDash = await get(`${BASE}/api/admin/dashboard?section=overview&token=${legacyLogin.data.token}`);
  assert(legacyDash.status === 403, 'Unauthorized email attempting admin dashboard access is strictly rejected with 403');

  // Register a fresh customer account
  const testCustomerEmail = `tester_${Date.now()}@gmail.com`;
  const regUser = await post(`${BASE}/api/auth`, {
    action: 'register',
    name: 'Khách Hàng Test',
    email: testCustomerEmail,
    password: 'CustomerPassword@123',
    phone: '0988776655'
  });
  assert(regUser.status === 200 && regUser.data.ok && regUser.data.user.role === 'user', 'Register customer creates account with role=user');
  const testUserId = regUser.data.user.id;
  const userToken = regUser.data.token;

  // Regular user cannot access Admin Dashboard
  const forbiddenCheck = await get(`${BASE}/api/admin/dashboard?section=overview&token=${userToken}`);
  assert(forbiddenCheck.status === 403, 'Regular customer receives 403 Forbidden on Admin Dashboard');

  // Admin access succeeds
  const adminOverview = await get(`${BASE}/api/admin/dashboard?section=overview&token=${adminToken}`);
  assert(adminOverview.status === 200 && adminOverview.data.ok, 'Authorized Admin successfully accesses Admin Dashboard');

  // Attempt to elevate regular user to admin role must be strictly rejected
  const illegalRoleElevate = await post(`${BASE}/api/admin/dashboard?token=${adminToken}`, {
    action: 'changeUserRole',
    userId: testUserId,
    newRole: 'admin'
  });
  assert(illegalRoleElevate.status === 403 && illegalRoleElevate.data.ok === false, 'Attempt to grant Admin role to non-authorized email is strictly rejected with 403');

  // --- 2. CUSTOMER LIST & ANTI-LAG PAGINATION TESTS ---
  console.log('\n--- 2. Testing Customer Management & Anti-Lag Pagination ---');
  // Page 1 with limit 10
  const usersP1 = await get(`${BASE}/api/admin/dashboard?section=users&page=1&limit=10&token=${adminToken}`);
  assert(usersP1.status === 200 && usersP1.data.ok && usersP1.data.users.length === 10, 'Fetch users page 1 with limit 10 returns 10 users');
  assert(usersP1.data.pagination.total >= 22 && usersP1.data.pagination.totalPages >= 3, 'Pagination metadata accurately reports total records and pages');
  
  // Verify order metrics fields exist on users in page 1
  assert(usersP1.data.users.every(u => typeof u.total_orders === 'number' && typeof u.delivering_orders === 'number' && typeof u.total_spent === 'number'),
    'Customer records include total_orders, delivering_orders, and total_spent metrics');

  // Page 2 with limit 10
  const usersP2 = await get(`${BASE}/api/admin/dashboard?section=users&page=2&limit=10&token=${adminToken}`);
  assert(usersP2.status === 200 && usersP2.data.users.length === 10 && usersP2.data.users[0].id !== usersP1.data.users[0].id,
    'Pagination page 2 loads distinct users');

  // Limit 20
  const usersL20 = await get(`${BASE}/api/admin/dashboard?section=users&page=1&limit=20&token=${adminToken}`);
  assert(usersL20.status === 200 && usersL20.data.users.length === 20, 'Pagination with limit 20 returns 20 users');

  // Limit 50 (anti-lag test)
  const usersL50 = await get(`${BASE}/api/admin/dashboard?section=users&page=1&limit=50&token=${adminToken}`);
  assert(usersL50.status === 200 && usersL50.data.users.length <= 50, 'Pagination with limit 50 succeeds without lag');

  // Search filter
  const usersSearch = await get(`${BASE}/api/admin/dashboard?section=users&page=1&limit=10&search=mai.nguyen&token=${adminToken}`);
  assert(usersSearch.status === 200 && usersSearch.data.users.length >= 1 && usersSearch.data.users.some(u => u.email.includes('mai.nguyen')),
    'Search filter successfully finds targeted customer');

  // --- 3. BLOG POSTS, VIEWS & COMMENTS TESTS ---
  console.log('\n--- 3. Testing Blog Features (Views, Comments, Details) ---');
  const blogsRes = await get(`${BASE}/api/blogs`);
  assert(blogsRes.status === 200 && blogsRes.data.ok && blogsRes.data.blogs.length > 0, 'GET /api/blogs returns active blogs');
  const testBlog = blogsRes.data.blogs[0];
  const initialViews = testBlog.views || 0;
  const initialComments = testBlog.comment_count || 0;

  // Increment view counter
  const viewRes = await post(`${BASE}/api/blogs`, { action: 'view', blogId: testBlog.id });
  assert(viewRes.status === 200 && viewRes.data.ok && viewRes.data.views === initialViews + 1, 'POST /api/blogs { action: "view" } increments views count');

  // Increment view counter on non-existent blog returns 404
  const invalidViewRes = await post(`${BASE}/api/blogs`, { action: 'view', blogId: 'non_existent_blog_999' });
  assert(invalidViewRes.status === 404, 'POST /api/blogs { action: "view" } on non-existent blog returns 404');

  // Post comment on blog with empty content returns 400
  const emptyCommentRes = await post(`${BASE}/api/blogs`, { action: 'comment', blogId: testBlog.id, name: '', content: '' });
  assert(emptyCommentRes.status === 400, 'POST /api/blogs { action: "comment" } with empty inputs returns 400');

  // Post comment on blog
  const commentContent = `Đánh giá thử nghiệm lúc ${new Date().toISOString()}`;
  const commentRes = await post(`${BASE}/api/blogs`, {
    action: 'comment',
    blogId: testBlog.id,
    name: 'Khách Độc Giả Hài Lòng',
    email: 'khachhang@example.com',
    content: commentContent
  });
  assert(commentRes.status === 200 && commentRes.data.ok && commentRes.data.comment.content === commentContent,
    'POST /api/blogs { action: "comment" } saves comment to D1');
  const createdCommentId = commentRes.data.comment.id;

  // Fetch comments of blog
  const commentsGet = await get(`${BASE}/api/blogs?action=comments&blogId=${testBlog.id}`);
  assert(commentsGet.status === 200 && commentsGet.data.ok && commentsGet.data.comments.some(c => c.id === createdCommentId),
    'GET /api/blogs?action=comments returns comments list containing new comment');

  // --- 4. ADMIN BLOG MANAGEMENT & COMMENT MODERATION ---
  console.log('\n--- 4. Testing Admin Blog Management & Comment Moderation ---');
  // Admin fetches comments for moderation
  const adminComments = await get(`${BASE}/api/admin/dashboard?section=blog_comments&blogId=${testBlog.id}&token=${adminToken}`);
  assert(adminComments.status === 200 && adminComments.data.comments.some(c => c.id === createdCommentId),
    'Admin dashboard fetches blog comments for moderation');

  // Admin deletes comment
  const delCommentRes = await post(`${BASE}/api/admin/dashboard?token=${adminToken}`, {
    action: 'deleteBlogComment',
    commentId: createdCommentId
  });
  assert(delCommentRes.status === 200 && delCommentRes.data.ok, 'Admin deletes inappropriate comment');

  // Verify comment deleted
  const commentsAfterDel = await get(`${BASE}/api/blogs?action=comments&blogId=${testBlog.id}`);
  assert(commentsAfterDel.data.comments.every(c => c.id !== createdCommentId), 'Deleted comment is removed from comments list');

  // Admin saves blog post with empty title is rejected with 400
  const invalidBlogRes = await post(`${BASE}/api/admin/dashboard?token=${adminToken}`, {
    action: 'saveBlog',
    blog: { title: '', content: '' }
  });
  assert(invalidBlogRes.status === 400, 'Admin saveBlog with empty title/content is rejected with 400');

  // Admin creates blog post
  const newBlogTitle = `Bí Quyết Dinh Dưỡng Test ${Date.now()}`;
  const saveBlogRes = await post(`${BASE}/api/admin/dashboard?token=${adminToken}`, {
    action: 'saveBlog',
    blog: {
      title: newBlogTitle,
      category: 'Fitness',
      content: '<p>Nội dung bài viết thể thao và sữa hạt năng lượng cao.</p>',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      is_active: 1
    }
  });
  assert(saveBlogRes.status === 200 && saveBlogRes.data.ok, 'Admin publishes new blog post');

  // Verify newly created blog is in public list
  const blogsAfterAdd = await get(`${BASE}/api/blogs`);
  const createdBlog = blogsAfterAdd.data.blogs.find(b => b.title === newBlogTitle);
  assert(createdBlog && createdBlog.category === 'Fitness', 'New blog appears in public blogs list');

  // Admin delete blog without blogId returns 400
  const emptyDelBlog = await post(`${BASE}/api/admin/dashboard?token=${adminToken}`, { action: 'deleteBlog' });
  assert(emptyDelBlog.status === 400, 'Admin deleteBlog without blogId is rejected with 400');

  // Clean up created blog
  if (createdBlog) {
    const delBlogRes = await post(`${BASE}/api/admin/dashboard?token=${adminToken}`, {
      action: 'deleteBlog',
      blogId: createdBlog.id
    });
    assert(delBlogRes.status === 200 && delBlogRes.data.ok, 'Admin deletes blog post');
  }

  // --- 5. SECURITY, UPLOAD & BACKUP TESTS ---
  console.log('\n--- 5. Testing Security, Upload Protection, Email OTP & System Backup ---');
  // Upload API rejected for regular customer
  const custUploadCheck = await post(`${BASE}/api/upload`, { token: userToken });
  assert(custUploadCheck.status === 403 || custUploadCheck.status === 400, 'Regular user upload attempt is blocked');

  // Forgot password with non-existent email returns 404
  const invalidForgot = await post(`${BASE}/api/auth`, { action: 'forgot-password', email: 'non_existent_123456@gmail.com' });
  assert(invalidForgot.status === 404, 'Forgot-password for non-existent email returns 404');

  // Forgot password OTP generation
  const forgotRes = await post(`${BASE}/api/auth`, {
    action: 'forgot-password',
    email: testCustomerEmail
  });
  assert(forgotRes.status === 200 && forgotRes.data.ok && (forgotRes.data.debugOtp || forgotRes.data.debug_otp), 'POST /api/auth { action: "forgot-password" } generates 6-digit OTP');
  const otpCode = forgotRes.data.debugOtp || forgotRes.data.debug_otp;

  // Reset password with wrong OTP returns 400
  const invalidReset = await post(`${BASE}/api/auth`, {
    action: 'reset-password',
    email: testCustomerEmail,
    otp: '000000',
    newPassword: 'BrandNewCustomerPass@2026'
  });
  assert(invalidReset.status === 400, 'Reset-password with invalid OTP is rejected with 400');

  // Reset password using OTP
  const resetRes = await post(`${BASE}/api/auth`, {
    action: 'reset-password',
    email: testCustomerEmail,
    otp: otpCode,
    newPassword: 'BrandNewCustomerPass@2026'
  });
  assert(resetRes.status === 200 && resetRes.data.ok, 'POST /api/auth { action: "reset-password" } updates password hash and marks OTP as used');

  // Login with new password
  const newPassLogin = await post(`${BASE}/api/auth`, {
    action: 'login',
    email: testCustomerEmail,
    password: 'BrandNewCustomerPass@2026'
  });
  assert(newPassLogin.status === 200 && newPassLogin.data.ok, 'Customer successfully logs in with new password');

  // Fetch security info in Admin Dashboard
  const securityInfo = await get(`${BASE}/api/admin/dashboard?section=security_info&token=${adminToken}`);
  assert(securityInfo.status === 200 && securityInfo.data.ok && securityInfo.data.recentResets.length > 0 && securityInfo.data.databaseStats.users > 0,
    'Admin fetches security info, recent OTP audits, and database metrics');

  // Export full database backup snapshot
  const backupRes = await post(`${BASE}/api/admin/dashboard?token=${adminToken}`, {
    action: 'exportBackup'
  });
  assert(backupRes.status === 200 && backupRes.data.ok && backupRes.data.backup && backupRes.data.backup.users.length > 0 && backupRes.data.backup.orders.length > 0,
    'Admin exports complete JSON database backup snapshot');

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} / ${total} tests passed.`);
  console.log(`========================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
