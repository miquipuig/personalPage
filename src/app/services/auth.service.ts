import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { lastValueFrom, throwError } from 'rxjs';
import { of } from 'rxjs';
import { SocialAuthService } from "@abacritt/angularx-social-login";
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token: string | null | undefined = null;
  authenticated = false;
  socialUser: any;
  user: any;
  constructor(private http: HttpClient) {
    const storedToken = localStorage.getItem('pp_token');
    if (storedToken) {
      this.token = storedToken;
      const storedUser = localStorage.getItem('pp_user');
      this.user = storedUser ? JSON.parse(storedUser) : null;
      this.authenticated = true;
    }
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  private persistSession(): void {
    if (this.token) {
      localStorage.setItem('pp_token', this.token);
    }
    if (this.user) {
      localStorage.setItem('pp_user', JSON.stringify(this.user));
    }
  }

  login( user: any, token?:string): Promise<any> {

    return new Promise((resolve, reject) => {
      this.http.post('api/login', { token: token, user: user }).subscribe({
        next: (response: any) => {
          if (response.token) {
            this.token = response.token;
            this.authenticated = true;
            if (response.user) {
              this.user = response.user;
            }
            this.persistSession();
          }
          resolve(response);
        },
        error: (error) => {
          console.error(error);
          reject(error.error);
        }
      });
  
    });
  }


  register(user: any, token: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post('api/register', { token: token, user: user }).subscribe({
        next: (response: any) => {
          if (response.token) {
            this.token = response.token;
            this.authenticated = true;
            if (response.user) {
              this.user = response.user;
            }
            this.persistSession();
          }
          resolve(response);
        },
        error: (error) => {
          console.error(error);
          reject(error.error);
        }
      });

    });
  }

  logout(){
    this.token = null;
    this.authenticated = false;
    this.user = null;
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_user');
  }

}
