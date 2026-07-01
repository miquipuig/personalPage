import { marked } from 'marked';
import hljs from 'highlight.js/lib/common';
import * as DOMPurifyNS from 'dompurify';

// dompurify's module shape varies (default vs namespace) depending on the
// resolved build; normalize to the instance with .sanitize.
const DOMPurify: any = (DOMPurifyNS as any).default ?? DOMPurifyNS;

const renderer = new marked.Renderer();

// Images can carry a width via a URL fragment, e.g. `![alt](/x.png#w=25%)`.
// We keep that convention so the editor still shows a real markdown image
// (not raw HTML), while the public/preview renderer turns it into a sized img.
renderer.image = (href: string | null, title: string | null, text: string): string => {
  let src = href || '';
  let width = '';
  const m = src.match(/#w=([\d.]+(?:vw|px|%)?)$/);
  if (m) {
    width = m[1];
    src = src.replace(/#w=[\d.]+(?:vw|px|%)?$/, '');
  }
  const titleAttr = title ? ` title="${escAttr(title)}"` : '';
  const caption = (text || '').trim();
  const img = `<img src="${escAttr(src)}" alt="${escAttr(caption)}"${titleAttr} style="width:100%;max-width:100%" loading="lazy" decoding="async">`;
  // Width is a percentage of the text column; max-width:100% guarantees the
  // figure never overflows the column. The alt text doubles as the caption
  // ("pie de foto") so every image shows its stored description.
  const figStyle = width
    ? ` style="width:${width};max-width:100%"`
    : ' style="max-width:100%"';
  const cap = caption ? `<figcaption>${escHtml(caption)}</figcaption>` : '';
  return `<figure class="post-figure"${figStyle}>${img}${cap}</figure>`;
};

function escAttr(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}
function escHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
}

// Fenced code blocks → highlight.js. Falls back to auto-detection when the
// language is unknown or unspecified.
renderer.code = (code: string, infostring: string | undefined): string => {
  const lang = (infostring || '').trim().split(/\s+/)[0];
  let body: string;
  try {
    body =
      lang && hljs.getLanguage(lang)
        ? hljs.highlight(code, { language: lang }).value
        : hljs.highlightAuto(code).value;
  } catch {
    body = code.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
  }
  const cls = lang ? ` language-${lang}` : '';
  return `<pre><code class="hljs${cls}">${body}</code></pre>`;
};

// Rough reading-time estimate: strip markdown punctuation, count words, assume
// 200 wpm. Shared by the public detail page and the editor preview so both
// show the same number.
export function estimateReadingMinutes(md: string): number {
  const text = (md || '').replace(/[#*_>`~\[\]()!\-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Give h1–h3 stable, unique ids so the table of contents can link to them.
function addHeadingIds(html: string): string {
  const used: Record<string, number> = {};
  return html.replace(/<(h[1-3])>([\s\S]*?)<\/\1>/g, (_m, tag, inner) => {
    const text = inner.replace(/<[^>]+>/g, '');
    let slug = slugify(text) || 'section';
    if (used[slug]) { used[slug]++; slug = `${slug}-${used[slug]}`; } else { used[slug] = 1; }
    return `<${tag} id="${slug}">${inner}</${tag}>`;
  });
}

export function renderMarkdown(md: string): string {
  let raw = addHeadingIds(marked.parse(md || '', { renderer }) as string);
  // marked wraps a lone image in <p>…</p>; a <figure> can't live inside a <p>,
  // so lift figures out of their wrapping paragraph.
  raw = raw.replace(/<p>(\s*<figure[\s\S]*?<\/figure>\s*)<\/p>/g, '$1');
  // DOMPurify needs a DOM; during SSR there's no window, so skip it (content is
  // admin-authored, and the browser re-sanitizes on hydration).
  if (typeof window === 'undefined' || !DOMPurify?.sanitize) {
    return raw;
  }
  return DOMPurify.sanitize(raw, { ADD_ATTR: ['width', 'loading', 'decoding'] });
}
