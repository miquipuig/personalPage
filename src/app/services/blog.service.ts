import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  constructor(private http: HttpClient) {}

  // --- Public ---
  listPosts(): Observable<any> {
    return this.http.get('api/blog/posts');
  }

  getPost(slug: string): Observable<any> {
    return this.http.get(`api/blog/posts/${slug}`);
  }

  // --- Admin ---
  adminListPosts(): Observable<any> {
    return this.http.get('api/blog/admin/posts');
  }

  getAdminPost(id: any): Observable<any> {
    return this.http.get(`api/blog/admin/posts/${id}`);
  }

  createPost(body: any): Observable<any> {
    return this.http.post('api/blog/admin/posts', body);
  }

  updatePost(id: any, body: any): Observable<any> {
    return this.http.put(`api/blog/admin/posts/${id}`, body);
  }

  deletePost(id: any): Observable<any> {
    return this.http.delete(`api/blog/admin/posts/${id}`);
  }

  checkAdmin(): Observable<any> {
    return this.http.get('api/blog/admin/me');
  }

  // Exchange a Google id_token for an admin JWT (allowlist-gated server-side).
  adminLogin(token: string): Observable<any> {
    return this.http.post('api/blog/admin/login', { token });
  }

  uploadImage(file: Blob | File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    // No explicit Content-Type: let the browser set the multipart boundary.
    return this.http.post('api/blog/admin/upload', formData);
  }

  listUploads(): Observable<any> {
    return this.http.get('api/blog/admin/uploads');
  }

  // force=true bypasses the in-use guard (server returns 409 + refs otherwise).
  deleteUpload(name: string, force = false): Observable<any> {
    const qs = force ? '?force=1' : '';
    return this.http.delete(`api/blog/admin/uploads/${encodeURIComponent(name)}${qs}`);
  }
}
