import { Component, ElementRef, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogService } from '../../../services/blog.service';
import { renderMarkdown } from '../../../shared/markdown.util';

@Component({
  selector: 'app-admin-api',
  templateUrl: './admin-api.component.html',
  styleUrls: ['./admin-api.component.css'],
})
export class AdminApiComponent implements OnInit {
  apiKey = '';
  loading = true;
  revealed = false;
  error = '';
  copiedKey = false;
  copiedHeader = false;
  copiedDoc = false;
  docHtml: SafeHtml = '';
  docMarkdown = '';

  constructor(private blog: BlogService, private sanitizer: DomSanitizer, private el: ElementRef) {}

  ngOnInit(): void {
    this.blog.getApiKey().subscribe({
      next: (r: any) => { this.apiKey = r?.key ?? ''; this.loading = false; this.buildDoc(); },
      error: () => { this.error = 'No s\'ha pogut carregar la clau.'; this.loading = false; this.buildDoc(); },
    });
  }

  get maskedKey(): string {
    if (!this.apiKey) return '';
    return this.apiKey.length > 10
      ? this.apiKey.slice(0, 4) + '••••••••••••' + this.apiKey.slice(-4)
      : '••••••••';
  }

  private copy(text: string, flag: 'copiedKey' | 'copiedHeader' | 'copiedDoc'): void {
    navigator.clipboard?.writeText(text).then(() => {
      (this as any)[flag] = true;
      setTimeout(() => { (this as any)[flag] = false; }, 1500);
    }).catch(() => {});
  }

  copyKey(): void { this.copy(this.apiKey, 'copiedKey'); }
  copyHeader(): void { this.copy(`X-API-Key: ${this.apiKey}`, 'copiedHeader'); }
  copyDoc(): void { this.copy(this.docMarkdown, 'copiedDoc'); }

  regenerate(): void {
    if (!confirm('Regenerar la clau invalidarà l\'anterior. Continuar?')) return;
    this.error = '';
    this.blog.regenerateApiKey().subscribe({
      next: (r: any) => { this.apiKey = r?.key ?? ''; this.revealed = true; this.buildDoc(); },
      error: () => { this.error = 'No s\'ha pogut regenerar la clau.'; },
    });
  }

  // Add a copy button to each rendered code block (body injected via innerHTML).
  private enhanceCodeBlocks(): void {
    const root = this.el.nativeElement.querySelector('.api-doc') as HTMLElement | null;
    if (!root) return;
    for (const pre of Array.from(root.querySelectorAll('pre')) as HTMLElement[]) {
      if (pre.querySelector('.code-copy')) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy';
      btn.textContent = 'Copy';
      btn.addEventListener('click', () => {
        const code = pre.querySelector('code')?.textContent ?? pre.textContent ?? '';
        navigator.clipboard?.writeText(code.replace(/Copy$/, '')).then(() => {
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
        }).catch(() => {});
      });
      pre.appendChild(btn);
    }
  }

  private buildDoc(): void {
    const origin = typeof location !== 'undefined' ? location.origin : 'https://miquelpuig.studio';
    const base = `${origin}/api/blog/admin`;
    const lines = [
      '# Blog Admin API',
      '',
      'Programmatic access to manage blog posts and images — built for automation',
      '(scripts, agents, CI). Everything the admin UI can do is available here.',
      '',
      '## Base URL',
      '',
      '```',
      base,
      '```',
      '',
      '## Authentication',
      '',
      'Send the API key in the `X-API-Key` header on **every** request. Use HTTPS only.',
      'Requests without a valid key get `401`.',
      '',
      '```bash',
      'export BLOG_API_KEY="<your-key>"   # copy it from this page',
      `export BASE="${base}"`,
      '```',
      '',
      '## Response & error format',
      '',
      'All responses are JSON. Success looks like `{ "ok": true, ... }`.',
      'Errors look like `{ "ok": false, "message": "..." }` with an HTTP status:',
      '',
      '| Status | Meaning |',
      '|---|---|',
      '| `200` | OK |',
      '| `400` | Bad request (e.g. missing image on upload) |',
      '| `401` | Missing or invalid API key |',
      '| `404` | Post / file not found |',
      '| `409` | Image in use (delete blocked) — body has `refs` |',
      '| `500` | Server error |',
      '',
      '## The post object',
      '',
      'Endpoints that return a post use this shape:',
      '',
      '```json',
      '{',
      '  "id": 12,',
      '  "title": "My post",',
      '  "slug": "my-post",',
      '  "excerpt": "Short summary",',
      '  "content": "## Heading\\n\\nMarkdown body…",',
      '  "coverImage": "/api/uploads/1699-abc.jpg",',
      '  "tags": ["api", "demo"],',
      '  "language": "ca",',
      '  "translationGroup": "a1b2c3d4e5f6a7b8",',
      '  "views": 42,',
      '  "published": true,',
      '  "publishedAt": "2026-06-30T00:00:00.000Z",',
      '  "createdAt": "2026-06-30T10:00:00.000Z",',
      '  "updatedAt": "2026-06-30T10:00:00.000Z"',
      '}',
      '```',
      '',
      '### Writable fields (create / update)',
      '',
      '> **For automated clients / agents:** always send `title`, `content`,',
      '> `excerpt`, `tags`, `language` and `coverImage`. Only `title` is strictly',
      '> required, but leaving the others empty makes the post look broken on the',
      '> site (no summary, no SEO, wrong language tag, no cover). Do NOT invent a',
      '> `slug` — it is generated from the title.',
      '',
      '| Field | Required? | Type / accepted values | What to put |',
      '|---|---|---|---|',
      '| `title` | **Required** | string | The headline. The URL `slug` is derived from it automatically — never send `slug`. |',
      '| `content` | **Required** | string (Markdown) | The article body. Use `##`/`###` headings, `**bold**`, lists, links `[t](url)`, images `![alt](url)`. |',
      '| `excerpt` | **Always set** | string, 1–2 sentences (~150 chars) | Plain-text summary. Powers the listing card, `<meta description>`, Open Graph and RSS. Never leave empty. |',
      '| `tags` | **Always set** | array of strings, e.g. `["ciberseguridad","qr"]` | 2–5 short lowercase topic tags. A comma string `"a,b,c"` also works. Drives related posts + tag filtering. |',
      '| `language` | **Always set** | exactly one of `"ca"`, `"es"`, `"en"` | The language the `content` is written in. Defaults to `"ca"` if omitted — set it to match the text or the language filter/hreflang will be wrong. |',
      '| `coverImage` | **Always set** | string URL | Upload an image first (`POST /upload`) and use the returned `url` (e.g. `/api/uploads/…`). Used as banner + social preview. |',
      '| `published` | optional | boolean (default `false`) | `true` to publish now, `false`/omit to keep as a draft. |',
      '| `publishedAt` | optional | `"YYYY-MM-DD"` or ISO string | Publish date. Empty → today. A **future** date schedules the post (see below). |',
      '| `translationOfId` | optional | number | Link this post as a translation of an existing one (see Multilingual). |',
      '',
      '### Multilingual posts',
      '',
      'Each post has a `language`. To link two posts as translations of each other,',
      'send `translationOfId` (the id of an existing sibling) when creating/updating;',
      'both end up sharing a `translationGroup`. The public site then shows only one',
      'version per group (matching the reader\'s language) and offers a switcher to',
      'the others. Set `translationOfId` to `null` to unlink.',
      '',
      '### Scheduled publishing',
      '',
      'A post with `published: true` but a `publishedAt` in the **future** stays hidden',
      'on the public site (list, detail, RSS, sitemap) until that moment, then appears',
      'automatically — no extra call needed. The admin list shows it as **Scheduled**.',
      '',
      '## Posts',
      '',
      '| Action | Method & path | Returns |',
      '|---|---|---|',
      '| List (incl. drafts) | `GET /posts` | `{ ok, posts: Post[] }` |',
      '| Get one | `GET /posts/:id` | `{ ok, post: Post }` |',
      '| Create | `POST /posts` | `{ ok, post: Post }` |',
      '| Update (partial) | `PUT /posts/:id` | `{ ok, post: Post }` |',
      '| Delete | `DELETE /posts/:id` | `{ ok: true }` |',
      '',
      '### List posts',
      '',
      '```bash',
      'curl "$BASE/posts" -H "X-API-Key: $BLOG_API_KEY"',
      '```',
      '',
      '### Create a post',
      '',
      'Send the **complete** shape below — fill every field, do not drop `excerpt`,',
      '`tags` or `language`:',
      '',
      '```bash',
      'curl -X POST "$BASE/posts" \\',
      '  -H "X-API-Key: $BLOG_API_KEY" -H "Content-Type: application/json" \\',
      '  -d \'{',
      '    "title": "My post",',
      '    "excerpt": "One or two sentences summarising the post for cards and SEO.",',
      '    "content": "## Heading\\n\\nText with **bold**, a [link](https://example.com) and an image.",',
      '    "coverImage": "/api/uploads/1699-abc.jpg",',
      '    "tags": ["ciberseguridad", "qr"],',
      '    "language": "es",',
      '    "published": true,',
      '    "publishedAt": "2026-06-30"',
      '  }\'',
      '```',
      '',
      '### Update a post (only the fields you send change)',
      '',
      '```bash',
      'curl -X PUT "$BASE/posts/12" \\',
      '  -H "X-API-Key: $BLOG_API_KEY" -H "Content-Type: application/json" \\',
      '  -d \'{"title": "New title", "published": false}\'',
      '```',
      '',
      '### Delete a post',
      '',
      '```bash',
      'curl -X DELETE "$BASE/posts/12" -H "X-API-Key: $BLOG_API_KEY"',
      '```',
      '',
      '## Images',
      '',
      '| Action | Method & path | Returns |',
      '|---|---|---|',
      '| Upload | `POST /upload` (multipart) | `{ ok, url }` |',
      '| List | `GET /uploads` | `{ ok, files: File[] }` |',
      '| Edit description | `PATCH /uploads/:name` | `{ ok: true }` |',
      '| Delete | `DELETE /uploads/:name?force=1` | `{ ok: true }` |',
      '',
      'A `File` is `{ id, name, url, description, originalName, size, mimetype, mtime }`.',
      'Deleting an image still used by a post returns `409` with `{ ok:false, refs:[{title,published}] }`;',
      'add `?force=1` to delete anyway.',
      '',
      '### Upload an image',
      '',
      'Send `multipart/form-data` with an `image` file part (and optional `description`).',
      'The response `url` (e.g. `/api/uploads/...`) is what you put in `coverImage` or in the body.',
      '',
      '```bash',
      'curl -X POST "$BASE/upload" \\',
      '  -H "X-API-Key: $BLOG_API_KEY" \\',
      '  -F "image=@/path/to/photo.jpg" -F "description=alt text"',
      '# -> { "ok": true, "url": "/api/uploads/1699-abc.jpg" }',
      '```',
      '',
      '### Image size in the body',
      '',
      'Embed images in markdown as `![alt](URL)`. Append `#w=PERCENT` to set the width',
      'as a percentage of the text column (never overflows it):',
      '',
      '```markdown',
      '![A photo](/api/uploads/1699-abc.jpg#w=50%)',
      '```',
      '',
      '## Full workflow (upload cover, then publish)',
      '',
      '```bash',
      'URL=$(curl -s -X POST "$BASE/upload" -H "X-API-Key: $BLOG_API_KEY" \\',
      '  -F "image=@cover.jpg" | python3 -c "import sys,json;print(json.load(sys.stdin)[\'url\'])")',
      '',
      'curl -X POST "$BASE/posts" -H "X-API-Key: $BLOG_API_KEY" \\',
      '  -H "Content-Type: application/json" \\',
      '  -d "{\\"title\\":\\"Auto\\",\\"content\\":\\"## Hi\\",\\"coverImage\\":\\"$URL\\",\\"published\\":true}"',
      '```',
      '',
      '## Public blog API (no key)',
      '',
      `These read-only endpoints live under \`${origin}/api/blog\` and need **no** API key.`,
      'They only return posts that are visible now (published and not scheduled).',
      '',
      '| Action | Method & path | Returns |',
      '|---|---|---|',
      '| List published posts | `GET /api/blog/posts` | `{ ok, posts: Post[] }` |',
      '| Get one + translations | `GET /api/blog/posts/:slug` | `{ ok, post, translations }` |',
      '| Track a page view | `POST /api/blog/track` | `{ ok: true }` |',
      '| RSS 2.0 feed | `GET /api/blog/rss` | XML |',
      '| Sitemap (with hreflang) | `GET /sitemap.xml` | XML |',
      '',
      '`translations` lists sibling language versions: `[{ slug, language, title }]`.',
      '',
      '### Track a view',
      '',
      'Body: `{ "page": "home" | "about" | "resume" | "contact" | "blog" | "post:<slug>", "referrer": "..." }`.',
      'A `post:<slug>` view also increments that post\'s `views`. Rate-limited per IP.',
      '',
      '```bash',
      'curl -X POST "' + origin + '/api/blog/track" \\',
      '  -H "Content-Type: application/json" \\',
      '  -d \'{"page":"post:my-post","referrer":""}\'',
      '```',
      '',
      '## Analytics (admin)',
      '',
      'Aggregated visit stats (needs the API key or an admin session).',
      '',
      '| Action | Method & path |',
      '|---|---|',
      '| Stats | `GET /analytics?days=30&country=ES` |',
      '| Get the API key | `GET /apikey` |',
      '| Regenerate the API key | `POST /apikey` |',
      '',
      '```bash',
      `curl "${base}/analytics?days=30" -H "X-API-Key: $BLOG_API_KEY"`,
      '```',
      '',
      'Returns totals (total + unique visits), per-page and per-referrer breakdowns,',
      'a per-country list, and a daily time series. `days` sets the window;',
      'the optional `country` filter narrows everything except the country list.',
      '',
      '## Examples in other languages',
      '',
      '### JavaScript (fetch)',
      '',
      '```js',
      'await fetch(`${BASE}/posts`, {',
      '  method: "POST",',
      '  headers: {',
      '    "X-API-Key": process.env.BLOG_API_KEY,',
      '    "Content-Type": "application/json",',
      '  },',
      '  body: JSON.stringify({',
      '    title: "Hi",',
      '    excerpt: "Short summary for cards and SEO.",',
      '    content: "## Hello",',
      '    coverImage: "/api/uploads/1699-abc.jpg",',
      '    tags: ["demo"],',
      '    language: "en",',
      '    published: true,',
      '  }),',
      '});',
      '```',
      '',
      '### Python (requests)',
      '',
      '```python',
      'import os, requests',
      'BASE = os.environ["BASE"]',
      'h = {"X-API-Key": os.environ["BLOG_API_KEY"]}',
      'requests.post(f"{BASE}/posts", headers=h, json={',
      '    "title": "Hi",',
      '    "excerpt": "Short summary for cards and SEO.",',
      '    "content": "## Hello",',
      '    "coverImage": "/api/uploads/1699-abc.jpg",',
      '    "tags": ["demo"],',
      '    "language": "en",',
      '    "published": True,',
      '})',
      '```',
    ];
    this.docMarkdown = lines.join('\n');
    this.docHtml = this.sanitizer.bypassSecurityTrustHtml(renderMarkdown(this.docMarkdown));
    setTimeout(() => this.enhanceCodeBlocks());
  }
}
