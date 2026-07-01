import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml, Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { renderMarkdown, estimateReadingMinutes } from '../../shared/markdown.util';
import { BlogService } from '../../services/blog.service';

const SITE = 'https://miquelpuig.studio';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css']
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  isSectionActive = false;
  post: any = null;
  html: SafeHtml = '';
  notFound = false;
  loaded = false;
  relatedPosts: any[] = [];
  translations: any[] = [];
  readingMinutes = 0;
  readingProgress = 0;
  comments: any[] = [];
  commentForm = { name: '', email: '', body: '', website: '' };
  commentSubmitting = false;
  commentPending = false;
  commentError = false;
  showEmoji = false;
  private emojiLoaded = false;

  async toggleEmoji(): Promise<void> {
    if (!this.isBrowser) return;
    // Lazy-load the <emoji-picker> custom element on first use (browser only).
    if (!this.emojiLoaded) {
      await import('emoji-picker-element');
      this.emojiLoaded = true;
    }
    this.showEmoji = !this.showEmoji;
    if (this.showEmoji) setTimeout(() => this.styleEmojiScrollbar());
  }

  // The picker's scrollbar lives in its shadow DOM (no CSS var for it), so
  // inject a style there to theme it instead of the default gray one.
  private styleEmojiScrollbar(): void {
    const picker: any = document.querySelector('emoji-picker');
    if (!picker?.shadowRoot || picker.__scrollStyled) return;
    const style = document.createElement('style');
    style.textContent = `
      * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.28) transparent; }
      ::-webkit-scrollbar { width: 10px; height: 10px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.22); border-radius: 6px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
    `;
    picker.shadowRoot.appendChild(style);
    picker.__scrollStyled = true;
  }

  // Close the emoji picker when clicking anywhere outside it or its button.
  @HostListener('document:click', ['$event'])
  onDocClick(ev: Event): void {
    if (!this.showEmoji) return;
    const t = ev.target as HTMLElement | null;
    if (t?.closest?.('.emoji-btn') || t?.closest?.('emoji-picker')) return;
    this.showEmoji = false;
  }

  onEmojiClick(ev: any, editor?: HTMLElement): void {
    const d = ev?.detail || {};
    const emoji = d.unicode || d.emoji?.unicode || d.emoji?.emoji;
    if (emoji && editor) {
      editor.focus();
      document.execCommand('insertText', false, emoji);
    }
    this.showEmoji = false;
  }

  // WYSIWYG contenteditable: toggle bold/italic on the current selection.
  // styleWithCSS=false makes the browser emit <b>/<i> tags (easy to convert).
  exec(cmd: 'bold' | 'italic', editor: HTMLElement): void {
    editor.focus();
    try { document.execCommand('styleWithCSS', false, 'false'); } catch { /* ignore */ }
    document.execCommand(cmd, false);
  }

  // Only bold/italic survive a paste — everything else becomes plain text.
  onPaste(ev: ClipboardEvent, editor: HTMLElement): void {
    ev.preventDefault();
    const html = ev.clipboardData?.getData('text/html');
    const safe = html ? this.sanitizeToBI(html) : this.escapeHtml(ev.clipboardData?.getData('text/plain') ?? '').replace(/\n/g, '<br>');
    editor.focus();
    document.execCommand('insertHTML', false, safe);
  }

  private escapeHtml(s: string): string {
    return (s || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
  }

  // Reduce arbitrary HTML to text with only <strong>/<em> preserved.
  private sanitizeToBI(html: string): string {
    const root = document.createElement('div');
    root.innerHTML = html;
    const walk = (node: Node): string => {
      let out = '';
      node.childNodes.forEach((n) => {
        if (n.nodeType === 3) { out += this.escapeHtml(n.textContent || ''); return; }
        if (n.nodeType !== 1) return;
        const el = n as HTMLElement;
        const tag = el.tagName.toLowerCase();
        const inner = walk(el);
        const style = (el.getAttribute('style') || '').toLowerCase();
        const bold = tag === 'b' || tag === 'strong' || /font-weight\s*:\s*(bold|[6-9]00)/.test(style);
        const italic = tag === 'i' || tag === 'em' || /font-style\s*:\s*italic/.test(style);
        if (tag === 'br') out += '<br>';
        else if (bold) out += `<strong>${inner}</strong>`;
        else if (italic) out += `<em>${inner}</em>`;
        else if (tag === 'p' || tag === 'div') out += inner + '<br>';
        else out += inner;
      });
      return out;
    };
    return walk(root);
  }

  // Convert the editor's HTML (only text + b/i) into markdown for storage.
  private editorToMarkdown(editor: HTMLElement): string {
    const walk = (node: Node): string => {
      let out = '';
      node.childNodes.forEach((n) => {
        if (n.nodeType === 3) { out += n.textContent || ''; return; }
        if (n.nodeType !== 1) return;
        const el = n as HTMLElement;
        const tag = el.tagName.toLowerCase();
        const inner = walk(el);
        const style = (el.getAttribute('style') || '').toLowerCase();
        const bold = tag === 'b' || tag === 'strong' || /font-weight\s*:\s*(bold|[6-9]00)/.test(style);
        const italic = tag === 'i' || tag === 'em' || /font-style\s*:\s*italic/.test(style);
        if (tag === 'br') out += '\n';
        else if (bold && inner.trim()) out += `**${inner}**`;
        else if (italic && inner.trim()) out += `*${inner}*`;
        else if (tag === 'p' || tag === 'div') out += (out && !out.endsWith('\n') ? '\n' : '') + inner;
        else out += inner;
      });
      return out;
    };
    return walk(editor).replace(/\n{3,}/g, '\n\n').trim();
  }

  // Render a comment body with a tiny safe subset of markdown (bold + italic).
  // The text is HTML-escaped first, so only our own <strong>/<em> tags survive.
  renderCommentBody(body: string): SafeHtml {
    const esc = (body || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
    const html = esc
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  private isBrowser: boolean;
  private paramsSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private sanitizer: DomSanitizer,
    private titleService: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser) return;
    const scrolled = window.scrollY || this.doc.documentElement.scrollTop || 0;
    const max = this.doc.documentElement.scrollHeight - window.innerHeight;
    this.readingProgress = max > 0 ? Math.min(100, Math.max(0, (scrolled / max) * 100)) : 0;
  }

  private absolutize(u?: string): string {
    if (!u) return '';
    return /^https?:\/\//i.test(u) ? u : SITE + (u.startsWith('/') ? '' : '/') + u;
  }

  private setSeo(post: any): void {
    const title = `${post.title} — Miquel Puig`;
    const desc = post.excerpt || '';
    const url = `${SITE}/blog/${post.slug}`;
    const img = post.coverImage ? this.absolutize(post.coverImage) : '';
    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: post.title });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:card', content: img ? 'summary_large_image' : 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: post.title });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
    if (img) {
      this.meta.updateTag({ property: 'og:image', content: img });
      this.meta.updateTag({ name: 'twitter:image', content: img });
    }
    this.setCanonical(url);
    this.setHreflang(post);
    this.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: desc,
      image: img || undefined,
      datePublished: post.publishedAt || undefined,
      dateModified: post.updatedAt || undefined,
      author: { '@type': 'Person', name: 'Miquel Puig' },
      mainEntityOfPage: url,
    });
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  // hreflang alternates: list every language version (self + linked
  // translations) so search engines serve the right one. Also set <html lang>.
  private setHreflang(post: any): void {
    for (const el of Array.from(this.doc.querySelectorAll('link[rel="alternate"][data-hreflang]'))) {
      el.parentNode?.removeChild(el);
    }
    this.doc.documentElement.setAttribute('lang', post.language || 'ca');
    const versions = [
      { lang: post.language || 'ca', slug: post.slug },
      ...(this.translations || []).map((t: any) => ({ lang: t.language || 'ca', slug: t.slug })),
    ];
    if (versions.length < 2) return;
    const def = versions.find((v) => v.lang === 'ca') || versions[0];
    for (const v of [...versions, { lang: 'x-default', slug: def.slug }]) {
      const link = this.doc.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', v.lang);
      link.setAttribute('href', `${SITE}/blog/${v.slug}`);
      link.setAttribute('data-hreflang', '1');
      this.doc.head.appendChild(link);
    }
  }

  private setJsonLd(data: object): void {
    let script = this.doc.getElementById('blog-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = this.doc.createElement('script');
      script.id = 'blog-jsonld';
      script.type = 'application/ld+json';
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }

  ngOnInit() {
    this.paramsSub = this.route.params.subscribe(params => {
      const slug = params['slug'];
      this.loadPost(slug);
    });
    setTimeout(() => { this.isSectionActive = true; }, 50);
  }

  ngOnDestroy() {
    this.paramsSub?.unsubscribe();
  }

  private loadRelated(current: any) {
    this.blogService.listPosts().subscribe({
      next: (res: any) => {
        const all: any[] = (res?.posts ?? []).filter((p: any) => p.slug !== current.slug);
        const myTags = new Set<string>((current.tags ?? []).map((t: string) => t.toLowerCase()));
        // Rank by number of shared tags, then by recency.
        const scored = all.map((p) => ({
          p,
          score: (p.tags ?? []).filter((t: string) => myTags.has(t.toLowerCase())).length,
        }));
        scored.sort((a, b) =>
          b.score - a.score ||
          (new Date(b.p.publishedAt).getTime() - new Date(a.p.publishedAt).getTime()));
        this.relatedPosts = scored.map((s) => s.p).slice(0, 5);
      },
      error: () => { this.relatedPosts = []; },
    });
  }

  private loadComments(slug: string): void {
    this.blogService.listComments(slug).subscribe({
      next: (res: any) => { this.comments = res?.comments ?? []; },
      error: () => { this.comments = []; },
    });
  }

  submitComment(editor?: HTMLElement): void {
    if (!this.post || this.commentSubmitting) return;
    const name = this.commentForm.name.trim();
    const body = editor ? this.editorToMarkdown(editor) : (this.commentForm.body || '');
    this.commentError = false;
    if (!name || !body.trim()) { this.commentError = true; return; }
    this.commentForm.body = body;
    this.commentSubmitting = true;
    this.blogService.addComment(this.post.slug, this.commentForm).subscribe({
      next: () => {
        this.commentSubmitting = false;
        this.commentPending = true;
        this.commentForm = { name: '', email: '', body: '', website: '' };
        if (editor) editor.innerHTML = '';
      },
      error: () => { this.commentSubmitting = false; this.commentError = true; },
    });
  }

  private loadPost(slug: string) {
    this.relatedPosts = [];
    this.translations = [];
    this.comments = [];
    this.commentPending = false;
    this.commentError = false;
    this.commentForm = { name: '', email: '', body: '', website: '' };
    this.loaded = false;
    this.notFound = false;
    this.blogService.getPost(slug).subscribe({
      next: (response: any) => {
        const post = response?.post ?? null;
        if (!post) {
          this.notFound = true;
          this.post = null;
        } else {
          this.post = post;
          this.translations = response?.translations ?? [];
          this.setSeo(post);
          const rendered = renderMarkdown(post.content ?? '');
          this.html = this.sanitizer.bypassSecurityTrustHtml(rendered);
          this.readingMinutes = estimateReadingMinutes(post.content ?? '');
          this.loadRelated(post);
          this.loadComments(post.slug);
        }
        this.loaded = true;
      },
      error: (error) => {
        console.error(error);
        this.notFound = true;
        this.post = null;
        this.loaded = true;
      }
    });
  }
}
