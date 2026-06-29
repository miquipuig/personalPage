import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeHtml, Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { renderMarkdown } from '../../shared/markdown.util';
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
  private paramsSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private sanitizer: DomSanitizer,
    private titleService: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document
  ) {}

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

  private loadPost(slug: string) {
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
          this.setSeo(post);
          const rendered = renderMarkdown(post.content ?? '');
          this.html = this.sanitizer.bypassSecurityTrustHtml(rendered);
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
