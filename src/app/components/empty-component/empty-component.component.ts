import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-empty-component',
  templateUrl: './empty-component.component.html',
  styleUrls: ['./empty-component.component.css'],
})
export class EmptyComponentComponent implements OnInit {
  isSectionActive = false;
  posts: any[] = [];

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.blogService.listPosts().subscribe({
      next: (res: any) => { this.posts = (res?.posts ?? []).slice(0, 3); },
      error: () => { this.posts = []; },
    });
    setTimeout(() => { this.isSectionActive = true; }, 50);
  }
}
