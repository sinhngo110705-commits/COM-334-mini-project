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

// Auto-migration: ensure blogs table exists
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
  } catch(e) { /* ignore if already exists */ }
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
