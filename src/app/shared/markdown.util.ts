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
  const m = src.match(/#w=(\d+%?)$/);
  if (m) {
    width = m[1];
    src = src.replace(/#w=\d+%?$/, '');
  }
  const titleAttr = title ? ` title="${title}"` : '';
  const widthAttr = width ? ` width="${width}"` : '';
  return `<img src="${src}" alt="${text || ''}"${titleAttr}${widthAttr} style="max-width:100%">`;
};

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

export function renderMarkdown(md: string): string {
  const raw = marked.parse(md || '', { renderer }) as string;
  // DOMPurify needs a DOM; during SSR there's no window, so skip it (content is
  // admin-authored, and the browser re-sanitizes on hydration).
  if (typeof window === 'undefined' || !DOMPurify?.sanitize) {
    return raw;
  }
  return DOMPurify.sanitize(raw, { ADD_ATTR: ['width'] });
}
