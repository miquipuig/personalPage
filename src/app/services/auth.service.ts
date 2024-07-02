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
  constructor(private http: HttpClient) { }

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
  }

}
