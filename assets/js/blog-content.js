import { safeUrl } from './site-content.js';

const TAGS = new Set('a b blockquote br caption center code div em figcaption figure font h1 h2 h3 h4 h5 h6 hr i img li ol p pre s span strong sub sup table tbody td th thead tr u ul'.split(' '));
const DISCARD = new Set(['iframe', 'object', 'script', 'style', 'template']);
const ALIGNABLE = new Set('blockquote caption center div figcaption h1 h2 h3 h4 h5 h6 li p td th'.split(' '));
const TEXT_ALIGNMENTS = new Set(['left', 'center', 'right', 'justify']);
const FONT_STACKS = new Map([
  ['DM Sans', '"DM Sans", Arial, sans-serif'],
  ['Arial', 'Arial, sans-serif'],
  ['Georgia', 'Georgia, serif'],
  ['Times New Roman', '"Times New Roman", serif'],
  ['Playfair Display', '"Playfair Display", Georgia, serif']
]);

export const BLOG_FONTS = [...FONT_STACKS.keys()];
// The seven native editing sizes, expressed as their CSS pixel equivalents.
export const BLOG_FONT_SIZES = [10, 13, 16, 18, 24, 32, 48];

export function blogFontName(value = '') {
  const family = value.split(',')[0].trim().replace(/^['"]|['"]$/g, '').toLowerCase();
  return BLOG_FONTS.find(font => font.toLowerCase() === family) || '';
}

function blogFontSize(node) {
  const size = /^(\d+(?:\.\d+)?)(px|pt|rem|em)$/.exec(node.style.fontSize);
  if (size) {
    const unit = size[2];
    const pixels = Number(size[1]) * ({ px: 1, pt: 4 / 3, rem: 16, em: 16 })[unit];
    return pixels >= 10 && pixels <= 72 ? size[0] : '';
  }
  const legacySize = node.localName === 'font' ? Number(node.getAttribute('size')) : 0;
  return BLOG_FONT_SIZES[legacySize - 1] ? `${BLOG_FONT_SIZES[legacySize - 1]}px` : '';
}

function copyTypography(source, target) {
  // Reconstruct only known text attributes from the inert document.
  const font = blogFontName(source.style.fontFamily || source.getAttribute('face') || '');
  const size = blogFontSize(source);
  const align = source.style.textAlign || source.getAttribute('align') ||
    (source.localName === 'center' ? 'center' : '');
  const weight = source.style.fontWeight;
  const fontStyle = source.style.fontStyle;
  const decoration = source.style.textDecorationLine.split(' ').filter(line => line === 'underline' || line === 'line-through');
  if (font) target.style.fontFamily = FONT_STACKS.get(font);
  if (size) target.style.fontSize = size;
  if (ALIGNABLE.has(source.localName) && TEXT_ALIGNMENTS.has(align)) target.style.textAlign = align;
  if (/^(normal|bold|[1-9]00)$/.test(weight)) target.style.fontWeight = weight;
  if (fontStyle === 'normal' || fontStyle === 'italic' || fontStyle === 'oblique') target.style.fontStyle = fontStyle;
  if (decoration.length) target.style.textDecorationLine = decoration.join(' ');
}

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
      const element = document.createElement(tag === 'font' ? 'span' : tag === 'center' ? 'div' : tag);
      if (tag === 'font' || tag === 'center' || node.hasAttribute('style') || node.hasAttribute('align')) {
        copyTypography(node, element);
      }
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
