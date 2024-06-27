import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token: string| null| undefined =null;
  authenticated = false;
  socialUser: any;
  constructor(private http:HttpClient) { }


  loginOAuth(socialUser: any): Promise<any> {
    
    return new Promise((resolve, reject) => {
      this.http.post('api/loginOAuth', {token: socialUser.idToken, socialUser: socialUser}).subscribe((response: any) => {
        console.log(response);
        resolve(response.token);
      })
    });
  }
}
