import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(private blogService: BlogService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.blogService.listPosts().subscribe({
      next: (response: any) => {
        this.posts = response?.posts ?? [];
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

  // Tag + free-text filter (applied before pagination).
  get filteredPosts(): any[] {
    let list = this.posts;
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
