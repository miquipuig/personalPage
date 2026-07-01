import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../../services/blog.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-comments',
  templateUrl: './admin-comments.component.html',
  styleUrls: ['./admin-comments.component.css'],
})
export class AdminCommentsComponent implements OnInit {
  comments: any[] = [];
  loading = true;
  error = '';

  constructor(private blog: BlogService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.blog.adminListComments().subscribe({
      next: (r: any) => { this.comments = r?.comments ?? []; this.loading = false; },
      error: () => { this.error = 'No s\'han pogut carregar els comentaris.'; this.loading = false; },
    });
  }

  get pendingCount(): number {
    return this.comments.filter((c) => !c.approved).length;
  }

  setApproved(c: any, approved: boolean): void {
    this.blog.setCommentApproved(c.id, approved).subscribe({
      next: () => { c.approved = approved; },
      error: () => { this.error = 'No s\'ha pogut actualitzar el comentari.'; },
    });
  }

  remove(c: any): void {
    if (!confirm('Eliminar aquest comentari? Aquesta acció no es pot desfer.')) return;
    this.blog.deleteComment(c.id).subscribe({
      next: () => { this.comments = this.comments.filter((x) => x.id !== c.id); },
      error: () => { this.error = 'No s\'ha pogut eliminar el comentari.'; },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
