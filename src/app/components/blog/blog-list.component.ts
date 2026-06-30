import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {
  isSectionActive = false;
  posts: any[] = [];
  loaded = false;
  activeTag = '';
  search = '';
  page = 1;
  pageSize = 9;
  activeLang = 'ca';
  readonly langLabels: Record<string, string> = { ca: 'Català', es: 'Español', en: 'English' };

  constructor(private blogService: BlogService, private route: ActivatedRoute, private router: Router) {}

  // Filter by a tag without following the card's link to the post.
  filterByTag(tag: string, ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.router.navigate(['/blog'], { queryParams: { tag } });
  }

  setLang(l: string): void {
    this.activeLang = l;
    this.page = 1;
  }

  langLabel(l: string): string {
    return this.langLabels[l] || (l || '').toUpperCase();
  }

  get availableLangs(): string[] {
    const set = new Set<string>();
    for (const p of this.posts) set.add(p.language || 'ca');
    return [...set];
  }

  ngOnInit() {
    if (typeof navigator !== 'undefined') {
      const n = (navigator.language || '').slice(0, 2).toLowerCase();
      if (n) this.activeLang = n;
    }
    this.blogService.listPosts().subscribe({
      next: (response: any) => {
        this.posts = response?.posts ?? [];
        // If the browser language isn't among the posts, fall back to one present.
        const langs = this.availableLangs;
        if (langs.length && !langs.includes(this.activeLang)) this.activeLang = langs[0];
        this.loaded = true;
      },
      error: (error) => {
        console.error(error);
        this.posts = [];
        this.loaded = true;
      }
    });
    this.route.queryParams.subscribe((q) => {
      this.activeTag = (q['tag'] ?? '').toString();
      this.page = 1;
    });
    setTimeout(() => { this.isSectionActive = true; }, 50);
  }

  // One post per translation group, preferring the active language.
  get collapsedPosts(): any[] {
    const groups = new Map<string, any>();
    for (const p of this.posts) {
      const key = p.translationGroup || ('s:' + p.id);
      const cur = groups.get(key);
      if (!cur) { groups.set(key, p); continue; }
      if (p.language === this.activeLang && cur.language !== this.activeLang) groups.set(key, p);
    }
    return [...groups.values()];
  }

  // Tag + free-text filter (applied before pagination), on the collapsed list.
  get filteredPosts(): any[] {
    let list = this.collapsedPosts;
    if (this.activeTag) {
      const t = this.activeTag.toLowerCase();
      list = list.filter((p) => (p.tags ?? []).some((tag: string) => tag.toLowerCase() === t));
    }
    const q = this.search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        (p.title ?? '').toLowerCase().includes(q) ||
        (p.excerpt ?? '').toLowerCase().includes(q) ||
        (p.tags ?? []).some((tag: string) => tag.toLowerCase().includes(q)));
    }
    return list;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPosts.length / this.pageSize));
  }

  get pagedPosts(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredPosts.slice(start, start + this.pageSize);
  }

  onSearchChange(): void {
    this.page = 1;
  }

  goToPage(n: number): void {
    this.page = Math.min(Math.max(1, n), this.totalPages);
  }
}
