import { safeUrl } from './site-content.js';

const TAGS = new Set('a b blockquote br caption code div em figcaption figure h1 h2 h3 h4 h5 h6 hr i img li ol p pre s span strong sub sup table tbody td th thead tr u ul'.split(' '));
const DISCARD = new Set(['iframe', 'object', 'script', 'style', 'template']);

export function renderBlogContent(content, { cover, imageBase = location.origin, format, wrapTables = true } = {}) {
  const result = document.createDocumentFragment();
  if (!content) return result;

  if (format !== 'html' && !/<\/?[a-z][\w-]*(?:\s[^<>]*|\s*\/?)>/i.test(content)) {
    for (const text of content.trim().split(/\r?\n(?:[ \t]*\r?\n)+/)) {
      const paragraph = document.createElement('p');
      text.split(/\r?\n/).forEach((line, index) => {
        if (index) paragraph.append(document.createElement('br'));
        paragraph.append(line);
      });
      result.append(paragraph);
    }
    return result;
  }

  const template = document.createElement('template');
  template.innerHTML = content;
  const coverUrl = safeUrl(cover, imageBase);
  let hasContent = false;

  function appendNodes(source, target) {
    for (const node of source.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        target.append(node.textContent);
        if (node.textContent.trim()) hasContent = true;
        continue;
      }
      if (node.nodeType !== Node.ELEMENT_NODE || node.namespaceURI !== 'http://www.w3.org/1999/xhtml') continue;
      const tag = node.localName;
      if (DISCARD.has(tag)) continue;
      if (!TAGS.has(tag)) {
        appendNodes(node, target);
        continue;
      }
      const element = document.createElement(tag);
      if (tag === 'img') {
        const src = safeUrl(node.getAttribute('src'), imageBase);
        if (!src || (!hasContent && src === coverUrl)) continue;
        const url = new URL(src);
        element.src = url.origin === imageBase ? `${url.pathname}${url.search}` : src;
        element.alt = node.getAttribute('alt') || '';
        element.loading = 'lazy';
        hasContent = true;
      }
      if (tag === 'a') {
        const href = safeUrl(node.getAttribute('href'), imageBase);
        if (href) element.href = href;
      }
      for (const attr of ['colspan', 'rowspan']) {
        const value = node.getAttribute(attr);
        if ((tag === 'th' || tag === 'td') && /^[1-9]\d?$/.test(value || '')) element.setAttribute(attr, value);
      }
      appendNodes(node, element);
      if (tag === 'table' && wrapTables) {
        const wrapper = document.createElement('div');
        wrapper.className = 'article-table';
        wrapper.append(element);
        target.append(wrapper);
      } else {
        target.append(element);
      }
    }
  }
  appendNodes(template.content, result);
  return result;
}
