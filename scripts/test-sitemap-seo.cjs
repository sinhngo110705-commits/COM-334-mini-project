const http = require('http');
const fs = require('fs');
const path = require('path');

function request(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function parseXmlUrls(xmlString) {
  // Validate basic XML syntax
  if (!xmlString.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
    throw new Error('Missing or invalid XML declaration header');
  }
  if (!xmlString.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
    throw new Error('Missing or invalid <urlset xmlns="..."> tag');
  }
  if (!xmlString.trim().endsWith('</urlset>')) {
    throw new Error('Sitemap does not close with </urlset>');
  }

  // Extract <url> blocks
  const urlRegex = /<url>([\s\S]*?)<\/url>/g;
  const urls = [];
  let match;
  while ((match = urlRegex.exec(xmlString)) !== null) {
    const block = match[1];
    const locMatch = /<loc>(.*?)<\/loc>/.exec(block);
    const lastmodMatch = /<lastmod>(.*?)<\/lastmod>/.exec(block);
    const changefreqMatch = /<changefreq>(.*?)<\/changefreq>/.exec(block);
    const priorityMatch = /<priority>(.*?)<\/priority>/.exec(block);

    urls.push({
      loc: locMatch ? locMatch[1] : null,
      lastmod: lastmodMatch ? lastmodMatch[1] : null,
      changefreq: changefreqMatch ? changefreqMatch[1] : null,
      priority: priorityMatch ? priorityMatch[1] : null
    });
  }

  return urls;
}

async function runTests() {
  console.log('====================================================');
  console.log('   SEO SITEMAP & ROBOTS.TXT VERIFICATION SUITE');
  console.log('====================================================\n');

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

  const BASE_HOST = '127.0.0.1';
  const BASE_PORT = 8080;

  // ----------------------------------------------------
  // TEST GROUP 1: ROBOTS.TXT DYNAMIC ENDPOINT
  // ----------------------------------------------------
  console.log('--- 1. Testing /robots.txt Dynamic Endpoint ---');
  const robotsRes = await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: '/robots.txt',
    method: 'GET'
  });

  assert(robotsRes.statusCode === 200, 'GET /robots.txt returns 200 OK');
  assert(
    robotsRes.headers['content-type'] && robotsRes.headers['content-type'].includes('text/plain'),
    'GET /robots.txt returns text/plain Content-Type'
  );
  assert(robotsRes.body.includes('User-agent: *'), '/robots.txt contains "User-agent: *"');
  assert(robotsRes.body.includes('Allow: /'), '/robots.txt contains "Allow: /"');
  assert(robotsRes.body.includes('Disallow: /admin.html'), '/robots.txt disallows /admin.html');
  assert(robotsRes.body.includes('Disallow: /admin'), '/robots.txt disallows /admin');
  assert(robotsRes.body.includes('Disallow: /account.html'), '/robots.txt disallows /account.html');
  assert(robotsRes.body.includes('Disallow: /account'), '/robots.txt disallows /account');
  assert(robotsRes.body.includes('Disallow: /api/admin/'), '/robots.txt disallows /api/admin/');
  assert(robotsRes.body.includes('Disallow: /api/admin'), '/robots.txt disallows /api/admin');
  assert(
    robotsRes.body.includes(`Sitemap: http://127.0.0.1:8080/sitemap.xml`),
    'Sitemap in /robots.txt adapts to local request origin'
  );

  // ----------------------------------------------------
  // TEST GROUP 2: ROBOTS.TXT & SITEMAP HOST HEADER ADAPTATION
  // ----------------------------------------------------
  console.log('\n--- 2. Testing Host Header & Multi-Proxy Adaptation ---');
  const robotsProdRes = await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: '/robots.txt',
    method: 'GET',
    headers: {
      'Host': 'hnguyenworks.id.vn',
      'X-Forwarded-Proto': 'https'
    }
  });

  assert(
    robotsProdRes.body.includes('Sitemap: https://hnguyenworks.id.vn/sitemap.xml'),
    '/robots.txt correctly uses production domain when requested via production host'
  );

  // Multi-proxy header test (comma-separated headers)
  const robotsMultiProxyRes = await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: '/robots.txt',
    method: 'GET',
    headers: {
      'X-Forwarded-Host': 'hnguyenworks.id.vn, cf-worker',
      'X-Forwarded-Proto': 'https, http'
    }
  });

  assert(
    robotsMultiProxyRes.body.includes('Sitemap: https://hnguyenworks.id.vn/sitemap.xml'),
    '/robots.txt correctly cleans multi-valued X-Forwarded-Host/Proto headers'
  );

  // ----------------------------------------------------
  // TEST GROUP 3: SITEMAP.XML DYNAMIC ENDPOINT & XML VALIDATION
  // ----------------------------------------------------
  console.log('\n--- 3. Testing /sitemap.xml Dynamic Endpoint & XML Standards ---');
  const sitemapRes = await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: '/sitemap.xml',
    method: 'GET'
  });

  assert(sitemapRes.statusCode === 200, 'GET /sitemap.xml returns 200 OK');
  assert(
    sitemapRes.headers['content-type'] && sitemapRes.headers['content-type'].includes('application/xml'),
    'GET /sitemap.xml Content-Type is application/xml'
  );

  let parsedUrls = [];
  try {
    parsedUrls = parseXmlUrls(sitemapRes.body);
    assert(parsedUrls.length > 0, 'Sitemap parsed successfully into URL entries', `Found ${parsedUrls.length} entries`);
  } catch (err) {
    assert(false, 'XML validation of /sitemap.xml', err.message);
  }

  // Check no private/admin pages in sitemap
  const disallowedFound = parsedUrls.filter(u => 
    u.loc.includes('admin') || u.loc.includes('account.html')
  );
  assert(disallowedFound.length === 0, 'Disallowed admin/account pages excluded from sitemap');

  // Verify static core pages
  const staticPaths = ['/', '/products.html', '/blog.html', '/about.html', '/contact.html', '/cart.html', '/privacy.html', '/terms.html'];
  for (const sp of staticPaths) {
    const found = parsedUrls.find(u => u.loc === `http://127.0.0.1:8080${sp}`);
    assert(!!found, `Static page included: ${sp}`, found ? `lastmod=${found.lastmod}, priority=${found.priority}` : 'Not found');
  }

  // Verify dynamic products from D1
  const productEntries = parsedUrls.filter(u => u.loc.includes('/products/'));
  assert(productEntries.length >= 6, `Dynamic products queried from D1: found ${productEntries.length} items (expected >= 6)`);
  if (productEntries.length > 0) {
    assert(
      productEntries.every(p => p.lastmod && /^\d{4}-\d{2}-\d{2}$/.test(p.lastmod)),
      'All product entries have valid W3C date format (YYYY-MM-DD)'
    );
    assert(
      productEntries.every(p => p.priority === '0.8' && p.changefreq === 'weekly'),
      'Product entries have appropriate priority (0.8) and changefreq (weekly)'
    );
  }

  // Verify dynamic blogs from D1
  const blogEntries = parsedUrls.filter(u => u.loc.includes('/blog/'));
  assert(blogEntries.length >= 6, `Dynamic blogs queried from D1: found ${blogEntries.length} items (expected >= 6)`);
  if (blogEntries.length > 0) {
    assert(
      blogEntries.every(b => b.lastmod && /^\d{4}-\d{2}-\d{2}$/.test(b.lastmod)),
      'All blog entries have valid W3C date format (YYYY-MM-DD)'
    );
    assert(
      blogEntries.every(b => b.priority === '0.8' && b.changefreq === 'weekly'),
      'Blog entries have appropriate priority (0.8) and changefreq (weekly)'
    );
  }

  // ----------------------------------------------------
  // TEST GROUP 4: SITEMAP BASE URL ADAPTATION
  // ----------------------------------------------------
  console.log('\n--- 4. Testing /sitemap.xml Base URL Adaptation ---');
  const sitemapProdRes = await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: '/sitemap.xml',
    method: 'GET',
    headers: {
      'Host': 'hnguyenworks.id.vn',
      'X-Forwarded-Proto': 'https'
    }
  });

  const prodUrls = parseXmlUrls(sitemapProdRes.body);
  const allProdLocs = prodUrls.every(u => u.loc.startsWith('https://hnguyenworks.id.vn/'));
  assert(allProdLocs, 'All <loc> URLs correctly use https://hnguyenworks.id.vn when Host header is sent');

  // Multi-proxy header adaptation for sitemap
  const sitemapMultiProxyRes = await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: '/sitemap.xml',
    method: 'GET',
    headers: {
      'X-Forwarded-Host': 'hnguyenworks.id.vn, edge-proxy',
      'X-Forwarded-Proto': 'https, http'
    }
  });
  const multiProxyUrls = parseXmlUrls(sitemapMultiProxyRes.body);
  const allMultiClean = multiProxyUrls.every(u => u.loc.startsWith('https://hnguyenworks.id.vn/'));
  assert(allMultiClean, 'All <loc> URLs cleanly resolve despite multi-valued reverse-proxy headers');

  // Test alias /sitemap and /api/sitemap
  const sitemapAliasRes = await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: '/sitemap',
    method: 'GET'
  });
  assert(sitemapAliasRes.statusCode === 200, 'GET /sitemap alias returns 200 OK');

  // ----------------------------------------------------
  // TEST GROUP 5: SEO REDIRECTS (/shop*, /product-detail*)
  // ----------------------------------------------------
  console.log('\n--- 5. Testing SEO Redirects ---');
  const redirectScenarios = [
    { path: '/shop.html', expectedDest: '/products.html' },
    { path: '/shop', expectedDest: '/products.html' },
    { path: '/shop/', expectedDest: '/products.html' },
    { path: '/product-detail.html', expectedDest: '/products.html' },
    { path: '/product-detail', expectedDest: '/products.html' },
    { path: '/product-detail/', expectedDest: '/products.html' },
    { path: '/product-detail.html?id=sp001', expectedDest: '/products/sp001' },
    { path: '/products.html?id=sp001', expectedDest: '/products/sp001' },
    { path: '/blog.html?slug=blg_dinh_duong_1', expectedDest: '/blog/blg_dinh_duong_1' }
  ];

  for (const scen of redirectScenarios) {
    const res = await request({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: scen.path,
      method: 'GET'
    });
    assert(res.statusCode === 301, `GET ${scen.path} returns 301 Permanent Redirect`);
    assert(
      res.headers.location && res.headers.location.includes(scen.expectedDest),
      `GET ${scen.path} redirects to ${scen.expectedDest}`
    );
  }

  for (const [detail, type] of [['/products/sp001', 'product'], ['/blog/blg_dinh_duong_1', 'article']]) {
    const response = await request({ hostname: BASE_HOST, port: BASE_PORT, path: detail, method: 'GET' });
    assert(response.statusCode === 200, `GET ${detail} opens directly`);
    assert(response.body.includes(`property="og:type" content="${type}"`), `GET ${detail} has item-specific metadata`);
    assert(
      response.body.includes(`rel="canonical" href="http://${BASE_HOST}:${BASE_PORT}${detail}"`),
      `GET ${detail} has its own canonical link`
    );
  }
  const missing = await request({ hostname: BASE_HOST, port: BASE_PORT, path: '/blog/absent', method: 'GET' });
  assert(missing.statusCode === 404, 'Missing article returns HTTP 404');

  // ----------------------------------------------------
  // TEST GROUP 6: STATIC FALLBACK FILES ON DISK
  // ----------------------------------------------------
  console.log('\n--- 6. Testing Static Fallback Files on Disk ---');
  const rootSitemapPath = path.resolve(__dirname, '..', 'sitemap.xml');
  const rootRobotsPath = path.resolve(__dirname, '..', 'robots.txt');
  const rootShopPath = path.resolve(__dirname, '..', 'shop.html');
  const rootProductDetailPath = path.resolve(__dirname, '..', 'product-detail.html');

  assert(fs.existsSync(rootSitemapPath), 'Static fallback sitemap.xml exists in root');
  assert(fs.existsSync(rootRobotsPath), 'Static fallback robots.txt exists in root');
  assert(fs.existsSync(rootShopPath), 'Static fallback shop.html exists in root');
  assert(fs.existsSync(rootProductDetailPath), 'Static fallback product-detail.html exists in root');

  const staticSitemapContent = fs.readFileSync(rootSitemapPath, 'utf8');
  let staticParsed = [];
  try {
    staticParsed = parseXmlUrls(staticSitemapContent);
    assert(staticParsed.length > 0, 'Static fallback sitemap.xml is valid XML', `Found ${staticParsed.length} entries`);
  } catch(e) {
    assert(false, 'Static fallback sitemap.xml XML parsing', e.message);
  }

  const staticRobotsContent = fs.readFileSync(rootRobotsPath, 'utf8');
  assert(staticRobotsContent.includes('Disallow: /admin.html'), 'Static robots.txt disallows /admin.html');
  assert(staticRobotsContent.includes('Disallow: /admin'), 'Static robots.txt disallows /admin');
  assert(staticRobotsContent.includes('Disallow: /account.html'), 'Static robots.txt disallows /account.html');
  assert(staticRobotsContent.includes('Disallow: /account'), 'Static robots.txt disallows /account');
  assert(staticRobotsContent.includes('Sitemap: https://hnguyenworks.id.vn/sitemap.xml'), 'Static robots.txt has production sitemap URL');

  const staticShopContent = fs.readFileSync(rootShopPath, 'utf8');
  assert(staticShopContent.includes('canonical" href="https://hnguyenworks.id.vn/products.html"'), 'shop.html has canonical to products.html');
  assert(staticShopContent.includes('refresh" content="0; url=/products.html"'), 'shop.html has meta refresh redirect');

  const staticProductDetailContent = fs.readFileSync(rootProductDetailPath, 'utf8');
  assert(staticProductDetailContent.includes('canonical" href="https://hnguyenworks.id.vn/products.html"'), 'product-detail.html has canonical to products.html');
  assert(staticProductDetailContent.includes('refresh" content="0; url=/products.html"'), 'product-detail.html has meta refresh redirect');

  // ----------------------------------------------------
  // TEST GROUP 7: CANONICAL, OPEN GRAPH & TWITTER TAGS IN HTML
  // ----------------------------------------------------
  console.log('\n--- 7. Testing Canonical & SEO Tags in HTML Files ---');
  const htmlFilesToCheck = [
    { file: 'index.html', canonical: 'https://hnguyenworks.id.vn/' },
    { file: 'products.html', canonical: 'https://hnguyenworks.id.vn/products.html' },
    { file: 'blog.html', canonical: 'https://hnguyenworks.id.vn/blog.html' },
    { file: 'about.html', canonical: 'https://hnguyenworks.id.vn/about.html' },
    { file: 'contact.html', canonical: 'https://hnguyenworks.id.vn/contact.html' },
    { file: 'cart.html', canonical: 'https://hnguyenworks.id.vn/cart.html' },
    { file: 'privacy.html', canonical: 'https://hnguyenworks.id.vn/privacy.html' },
    { file: 'terms.html', canonical: 'https://hnguyenworks.id.vn/terms.html' }
  ];

  for (const item of htmlFilesToCheck) {
    const fullPath = path.resolve(__dirname, '..', item.file);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert(
      content.includes(`rel="canonical" href="${item.canonical}"`),
      `${item.file} has correct canonical link (${item.canonical})`
    );
    assert(
      content.includes('rel="sitemap"') || item.file === 'index.html',
      `${item.file} includes sitemap link`
    );
    assert(
      content.includes('property="og:title"'),
      `${item.file} has Open Graph og:title`
    );
    assert(
      content.includes('name="twitter:card"'),
      `${item.file} has Twitter Card tag`
    );
  }

  const accountContent = fs.readFileSync(path.resolve(__dirname, '..', 'account.html'), 'utf8');
  assert(accountContent.includes('noindex, nofollow'), 'account.html has robots noindex, nofollow');

  const adminContent = fs.readFileSync(path.resolve(__dirname, '..', 'admin.html'), 'utf8');
  assert(adminContent.includes('noindex, nofollow'), 'admin.html has robots noindex, nofollow');

  console.log(`\n====================================================`);
  console.log(`TEST SUMMARY: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`====================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
