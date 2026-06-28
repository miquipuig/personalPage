import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml, Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { renderMarkdown } from '../../shared/markdown.util';
import { BlogService } from '../../services/blog.service';

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
    private meta: Meta
  ) {}

  private setSeo(post: any): void {
    const title = `${post.title} — Miquel Puig`;
    const desc = post.excerpt || '';
    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: post.title });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    if (post.coverImage) {
      this.meta.updateTag({ property: 'og:image', content: post.coverImage });
    }
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
