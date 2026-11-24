import { renderBlogContent } from './blog-content.js';
import { safeUrl } from './site-content.js';

const modal = document.getElementById('blog-modal');
const form = document.getElementById('blog-form');
const fields = form.elements;
const editor = document.getElementById('blog-content');
const toolbar = document.getElementById('blog-toolbar');
const coverImage = document.getElementById('blog-image-preview');
const editorStatus = document.getElementById('blog-editor-status');
const inlineImage = document.getElementById('blog-inline-image');
const saveButton = document.getElementById('blog-save-button');
let selection;
let coverObjectUrl;

function previewCover() {
  if (coverObjectUrl) URL.revokeObjectURL(coverObjectUrl);
  const file = fields.coverFile.files[0];
  coverObjectUrl = file ? URL.createObjectURL(file) : null;
  const url = coverObjectUrl || safeUrl(fields.coverUrl.value, location.origin);
  coverImage.hidden = !url;
  if (url) coverImage.src = url;
  else coverImage.removeAttribute('src');
}

function open(blog) {
  form.reset();
  selection = null;
  editorStatus.textContent = '';
  document.getElementById('blog-modal-title').textContent = blog ? 'Chỉnh sửa bài viết' : 'Thêm bài viết';
  fields.blogId.value = blog?.id || '';
  fields.title.value = blog?.title || '';
  fields.category.value = blog?.category || 'Dinh Dưỡng';
  if (!fields.category.value) fields.category.value = 'Dinh Dưỡng';
  fields.coverUrl.value = blog?.image_url || '';
  fields.active.value = blog && !blog.is_active ? '0' : '1';
  editor.replaceChildren(renderBlogContent(blog?.content, { wrapTables: false }));
  previewCover();
  modal.style.display = 'flex';
  fields.title.focus();
}

document.addEventListener('selectionchange', () => {
  const current = window.getSelection();
  if (current.rangeCount && editor.contains(current.getRangeAt(0).commonAncestorContainer)) {
    selection = current.getRangeAt(0).cloneRange();
  }
});

function focusAtSelection() {
  editor.focus();
  const current = window.getSelection();
  if (!selection || !editor.contains(selection.commonAncestorContainer)) {
    selection = document.createRange();
    selection.selectNodeContents(editor);
    selection.collapse(false);
  }
  current.removeAllRanges();
  current.addRange(selection);
}

toolbar.addEventListener('mousedown', event => {
  if (event.target.closest('button')) event.preventDefault();
});

toolbar.addEventListener('click', event => {
  const button = event.target.closest('button[data-command]');
  if (!button) return;
  const command = button.dataset.command;
  if (command === 'image') {
    inlineImage.click();
    return;
  }
  let value = button.dataset.value || null;
  if (command === 'createLink') {
    if (!selection || selection.collapsed) {
      editorStatus.textContent = 'Bôi đen đoạn chữ bạn muốn gắn liên kết.';
      return;
    }
    value = safeUrl(prompt('Đường dẫn liên kết'), location.origin);
    if (!value) return;
  }
  focusAtSelection();
  document.execCommand(command, false, value);
  editorStatus.textContent = '';
});

editor.addEventListener('paste', event => {
  event.preventDefault();
  const html = event.clipboardData.getData('text/html');
  if (html) {
    const sanitized = document.createElement('div');
    sanitized.append(renderBlogContent(html, { wrapTables: false }));
    if (sanitized.textContent.trim() || sanitized.querySelector('img')) {
      document.execCommand('insertHTML', false, sanitized.innerHTML);
      return;
    }
  }
  document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
});
editor.addEventListener('drop', event => event.preventDefault());
fields.coverUrl.addEventListener('input', () => {
  fields.coverFile.value = '';
  previewCover();
});
fields.coverFile.addEventListener('change', () => {
  editorStatus.textContent = fields.coverFile.files.length ? 'Ảnh bìa sẽ được tải lên khi lưu.' : '';
  previewCover();
});
coverImage.addEventListener('error', () => { coverImage.hidden = true; });

async function upload(file) {
  const data = new FormData();
  data.append('file', file);
  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: data
  });
  const result = await response.json();
  if (!result.ok) throw new Error(result.message || 'Không thể tải ảnh.');
  return result.imageUrl;
}

function setBusy(busy, message = '') {
  form.querySelector('fieldset').disabled = busy;
  editor.contentEditable = String(!busy);
  saveButton.disabled = busy;
  editorStatus.textContent = message;
}

inlineImage.addEventListener('change', async () => {
  const file = inlineImage.files[0];
  if (!file) return;
  const alt = prompt('Mô tả ngắn cho ảnh (tùy chọn)', '');
  if (alt === null) {
    inlineImage.value = '';
    return;
  }
  setBusy(true, 'Đang tải ảnh trong bài…');
  try {
    const src = await upload(file);
    const image = document.createElement('img');
    image.setAttribute('src', src);
    image.alt = alt.trim();
    setBusy(false);
    focusAtSelection();
    document.execCommand('insertHTML', false, image.outerHTML);
  } catch (error) {
    setBusy(false, error.message || 'Không thể tải ảnh.');
  } finally {
    inlineImage.value = '';
  }
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const clean = document.createElement('div');
  clean.append(renderBlogContent(editor.innerHTML, { wrapTables: false, format: 'html' }));
  const title = fields.title.value.trim();
  if (!title || !clean.textContent.trim()) {
    editorStatus.textContent = 'Vui lòng nhập tiêu đề và nội dung bài viết.';
    return;
  }
  const blog = {
    id: fields.blogId.value,
    title,
    category: fields.category.value,
    image_url: fields.coverUrl.value.trim(),
    content: clean.children.length ? clean.innerHTML : `<p>${clean.innerHTML}</p>`,
    is_active: Number(fields.active.value)
  };
  const file = fields.coverFile.files[0];
  setBusy(true, file ? 'Đang tải ảnh bìa…' : 'Đang lưu bài viết…');
  try {
    if (file) {
      blog.image_url = await upload(file);
      fields.coverUrl.value = blog.image_url;
      fields.coverFile.value = '';
      previewCover();
      setBusy(true, 'Đang lưu bài viết…');
    }
    const response = await fetch(`${API_BASE}/admin/dashboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ action: 'saveBlog', blog })
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.message || 'Không thể lưu bài viết.');
    setBusy(false);
    modal.style.display = 'none';
    loadSection('blogs');
  } catch (error) {
    setBusy(false, error.message || 'Không thể lưu bài viết.');
  }
});

document.getElementById('blog-cancel').addEventListener('click', () => {
  if (coverObjectUrl) URL.revokeObjectURL(coverObjectUrl);
  coverObjectUrl = null;
  modal.style.display = 'none';
});

window.DanaBlogEditor = { open };
