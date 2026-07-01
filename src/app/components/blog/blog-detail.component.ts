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
  }

  // Close the emoji picker when clicking anywhere outside it or its button.
  @HostListener('document:click', ['$event'])
  onDocClick(ev: Event): void {
    if (!this.showEmoji) return;
    const t = ev.target as HTMLElement | null;
    if (t?.closest?.('.emoji-btn') || t?.closest?.('emoji-picker')) return;
    this.showEmoji = false;
  }

  onEmojiClick(ev: any, ta?: HTMLTextAreaElement): void {
    const d = ev?.detail || {};
    const emoji = d.unicode || d.emoji?.unicode || d.emoji?.emoji;
    if (emoji) this.insertAtCursor(ta, emoji);
    this.showEmoji = false;
  }

  // Wrap the current selection with markdown markers (bold/italic).
  format(before: string, after: string, ta?: HTMLTextAreaElement): void {
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const val = this.commentForm.body || '';
    const sel = val.slice(start, end) || 'text';
    const next = val.slice(0, start) + before + sel + after + val.slice(end);
    this.commentForm.body = next;
    // Restore focus and select the wrapped text.
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
  }

  private insertAtCursor(ta: HTMLTextAreaElement | undefined, text: string): void {
    const val = this.commentForm.body || '';
    if (!ta) { this.commentForm.body = val + text; return; }
    const start = ta.selectionStart ?? val.length;
    const end = ta.selectionEnd ?? val.length;
    this.commentForm.body = val.slice(0, start) + text + val.slice(end);
    setTimeout(() => { ta.focus(); const pos = start + text.length; ta.setSelectionRange(pos, pos); });
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

  submitComment(): void {
    if (!this.post || this.commentSubmitting) return;
    const name = this.commentForm.name.trim();
    const body = this.commentForm.body.trim();
    this.commentError = false;
    if (!name || !body) { this.commentError = true; return; }
    this.commentSubmitting = true;
    this.blogService.addComment(this.post.slug, this.commentForm).subscribe({
      next: () => {
        this.commentSubmitting = false;
        this.commentPending = true;
        this.commentForm = { name: '', email: '', body: '', website: '' };
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
