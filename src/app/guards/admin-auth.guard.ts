import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BlogService } from '../services/blog.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {
  constructor(private blogService: BlogService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.blogService.checkAdmin().pipe(
      map(() => true),
      catchError(() => of(this.router.parseUrl('/admin/login')))
    );
  }
}
