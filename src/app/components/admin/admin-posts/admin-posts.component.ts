import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../../services/blog.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-posts',
  templateUrl: './admin-posts.component.html',
  styleUrls: ['./admin-posts.component.css']
})
export class AdminPostsComponent implements OnInit {
  posts: any[] = [];
  loading = false;
  error = '';

  constructor(
    private blogService: BlogService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.error = '';
    this.blogService.adminListPosts().subscribe({
      next: (res: any) => {
        this.posts = Array.isArray(res) ? res : (res?.posts ?? []);
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load posts.';
        this.loading = false;
      }
    });
  }

  deletePost(post: any): void {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      return;
    }
    this.blogService.deletePost(post.id).subscribe({
      next: () => this.loadPosts(),
      error: () => {
        this.error = 'Could not delete post.';
      }
    });
  }

  togglePublish(post: any): void {
    this.blogService.updatePost(post.id, { published: !post.published }).subscribe({
      next: () => this.loadPosts(),
      error: () => {
        this.error = 'Could not update post.';
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
