import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

// On the server (SSR) there is no page origin, so relative API calls like
// `api/blog/posts` must be made absolute. The server provides this token with
// the backend origin; in the browser it's absent and requests stay relative.
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable()
export class ApiBaseInterceptor implements HttpInterceptor {
  constructor(@Optional() @Inject(API_BASE_URL) private base: string | null) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.base && !/^https?:\/\//i.test(req.url)) {
      const url = this.base.replace(/\/$/, '') + '/' + req.url.replace(/^\//, '');
      return next.handle(req.clone({ url }));
    }
    return next.handle(req);
  }
}
