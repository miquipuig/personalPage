import { marked } from 'marked';

// Images can carry a width via a URL fragment, e.g. `![alt](/x.png#w=25%)`.
// We keep that convention so the editor still shows a real markdown image
// (not raw HTML), while the public/preview renderer turns it into a sized img.
const renderer = new marked.Renderer();
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

export function renderMarkdown(md: string): string {
  return marked.parse(md || '', { renderer }) as string;
}
