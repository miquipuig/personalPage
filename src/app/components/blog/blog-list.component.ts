import { Component, OnInit } from '@angular/core';
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

  constructor(private blogService: BlogService) {}

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
    setTimeout(() => { this.isSectionActive = true; }, 50);
  }
}
